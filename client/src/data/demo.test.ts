import { describe, expect, it } from "vitest";
import {
  DEMO_CUSTOMER,
  DEMO_MAX_LINES,
  DEMO_MAX_QUANTITY,
  DEMO_SCHEMA_VERSION,
  DEMO_STORAGE_KEY,
  addCartLine,
  advanceDemoOrder,
  calculateCartTotals,
  cartLineIdentity,
  createDemoOrder,
  createEmptyDemoState,
  demoBranches,
  getDemoCartItems,
  parseDemoStorage,
  readDemoStorage,
  removeCartLine,
  sanitizeCartLines,
  sanitizeDemoOrder,
  serializeDemoState,
  updateCartLineQuantity,
  writeDemoStorage,
  type CartLine,
} from "./demo";

describe("demo catalog cart", () => {
  it("derives line items and integer SAR totals from the current approved catalog", () => {
    const cart: CartLine[] = [
      { productSlug: "grape-classic", optionId: "pack-10", quantity: 3 },
      { productSlug: "fatteh-large", optionId: "large", quantity: 2 },
    ];

    const items = getDemoCartItems(cart);
    expect(items.map(item => item.totalSar)).toEqual([30, 30]);
    expect(calculateCartTotals(cart)).toEqual({
      totalSar: 60,
      totalQuantity: 5,
    });
    expect(Number.isSafeInteger(calculateCartTotals(cart).totalSar)).toBe(true);
  });

  it("rejects invalid quantities, unknown options, per-line overflow, and a 35th line", () => {
    const empty: CartLine[] = [];
    expect(addCartLine(empty, "grape-classic", "pack-10", 0).changed).toBe(
      false
    );
    expect(addCartLine(empty, "grape-classic", "pack-10", 1.5).changed).toBe(
      false
    );
    expect(
      addCartLine(empty, "grape-classic", "not-an-option", 1).changed
    ).toBe(false);

    const atCap = [
      {
        productSlug: "grape-classic",
        optionId: "pack-10",
        quantity: DEMO_MAX_QUANTITY,
      },
    ];
    expect(addCartLine(atCap, "grape-classic", "pack-10", 1).changed).toBe(
      false
    );
    expect(
      updateCartLineQuantity(
        empty,
        "grape-classic",
        "pack-10",
        DEMO_MAX_QUANTITY + 1
      ).changed
    ).toBe(false);

    const everyOption: CartLine[] = [
      ...[10, 20, 30, 40, 50, 60, 70].flatMap(pieces =>
        [
          "grape-classic",
          "grape-spicy",
          "cabbage-classic",
          "cabbage-spicy",
        ].map(productSlug => ({
          productSlug,
          optionId: `pack-${pieces}`,
          quantity: 1,
        }))
      ),
      { productSlug: "fatteh", optionId: "standard", quantity: 1 },
      { productSlug: "fatteh-large", optionId: "large", quantity: 1 },
      { productSlug: "kibbeh-chicken", optionId: "pack-5", quantity: 1 },
      { productSlug: "kibbeh-meat", optionId: "pack-5", quantity: 1 },
      { productSlug: "mahshi", optionId: "pack-5", quantity: 1 },
      { productSlug: "mahshi", optionId: "pack-10", quantity: 1 },
    ];
    expect(everyOption).toHaveLength(DEMO_MAX_LINES);
    expect(
      addCartLine(everyOption, "grape-classic", "pack-10", 1).changed
    ).toBe(true);
    expect(
      removeCartLine(everyOption, "grape-classic", "pack-10").cart
    ).toHaveLength(DEMO_MAX_LINES - 1);
    expect(sanitizeCartLines([...everyOption, everyOption[0]])).toEqual([]);
  });

  it("uses a collision-safe product-option identity rather than user values or prices", () => {
    expect(cartLineIdentity("a|b", "c")).not.toBe(cartLineIdentity("a", "b|c"));
    expect(cartLineIdentity("grape-classic", "pack-10")).toBe(
      '["grape-classic","pack-10"]'
    );
  });
});

describe("demo-only branches and orders", () => {
  it("derives ordinal demo labels without real branch fields", () => {
    expect(demoBranches).toHaveLength(12);
    expect(demoBranches[0]).toEqual({
      id: "branch-record-1",
      ordinal: 1,
      city: "عنيزة",
      label: "فرع تجريبي ١ — عنيزة",
    });
    expect(Object.fromEntries([...new Set(demoBranches.map(branch => branch.city))].map(city => [city, demoBranches.filter(branch => branch.city === city).length]))).toEqual({ "عنيزة": 2, "بريدة": 2, "حائل": 3, "الرس": 2, "الرياض": 1, "حفر الباطن": 2 });
    expect(JSON.stringify(demoBranches)).not.toContain("phone");
    expect(JSON.stringify(demoBranches)).not.toContain("address");
  });

  it("creates a fixed-shape order only after a valid explicit branch selection", () => {
    const state = {
      cart: [{ productSlug: "mahshi", optionId: "pack-10", quantity: 2 }],
      branchId: "branch-record-1",
      fulfillment: "delivery" as const,
      payment: "cash" as const,
    };
    const order = createDemoOrder(
      state,
      "DEMO-test-1",
      "2026-10-22T02:00:00.000Z"
    );

    expect(order).toMatchObject({
      id: "DEMO-test-1",
      branchId: "branch-record-1",
      fulfillment: "delivery",
      payment: "cash",
      totalSar: 40,
      step: 0,
      kind: "demo",
    });
    expect(order).not.toHaveProperty("customer");
    expect(createDemoOrder({ ...state, branchId: null })).toBeNull();
    expect(advanceDemoOrder(order)?.step).toBe(1);
    expect(advanceDemoOrder({ ...order!, step: 3 })?.step).toBe(3);
  });
});

describe("versioned local demo storage", () => {
  it("sanitizes persisted data, recalculates tampered order totals, and omits demo customer fields", () => {
    const order = createDemoOrder(
      {
        cart: [{ productSlug: "fatteh", optionId: "standard", quantity: 2 }],
        branchId: "branch-record-2",
        fulfillment: "pickup",
        payment: "mada",
      },
      "DEMO-restore-1",
      "2026-10-22T02:00:00.000Z"
    );
    const raw = JSON.stringify({
      version: DEMO_SCHEMA_VERSION,
      cart: [
        { productSlug: "grape-classic", optionId: "pack-20", quantity: 2 },
      ],
      branchId: "branch-record-2",
      fulfillment: "pickup",
      payment: "mada",
      order: { ...order, totalSar: 999999, injected: { deeply: ["ignored"] } },
    });

    const restored = parseDemoStorage(raw);
    expect(restored.cart).toEqual([
      { productSlug: "grape-classic", optionId: "pack-20", quantity: 2 },
    ]);
    expect(restored.order?.totalSar).toBe(20);

    const serialized = serializeDemoState(restored);
    expect(serialized).not.toContain(DEMO_CUSTOMER.name);
    expect(serialized).not.toContain(DEMO_CUSTOMER.phone);
    expect(serialized).not.toContain(DEMO_CUSTOMER.address);
  });

  it("fails closed for malformed, over-sized, nested, or failing browser storage", () => {
    expect(parseDemoStorage("not json")).toEqual(createEmptyDemoState());
    expect(parseDemoStorage("x".repeat(16 * 1024 + 1))).toEqual(
      createEmptyDemoState()
    );
    expect(
      parseDemoStorage(
        JSON.stringify({
          version: DEMO_SCHEMA_VERSION,
          cart: [[[[{ productSlug: "grape-classic" }]]]],
        })
      )
    ).toEqual(createEmptyDemoState());

    expect(
      readDemoStorage({
        getItem() {
          throw new Error("unavailable");
        },
      })
    ).toEqual(createEmptyDemoState());

    expect(
      writeDemoStorage(createEmptyDemoState(), {
        setItem() {
          throw new Error("quota");
        },
      })
    ).toBe(false);
  });

  it("writes under the single demo key with no account, payment-card, or contact data", () => {
    const saved: Record<string, string> = {};
    const didWrite = writeDemoStorage(createEmptyDemoState(), {
      setItem(key, value) {
        saved[key] = value;
      },
    });

    expect(didWrite).toBe(true);
    expect(Object.keys(saved)).toEqual([DEMO_STORAGE_KEY]);
    expect(saved[DEMO_STORAGE_KEY]).toContain('"version":1');
    expect(saved[DEMO_STORAGE_KEY]).not.toMatch(/card|05XXXXXXXX|عميل العرض/u);
  });
});
