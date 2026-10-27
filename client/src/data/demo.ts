import { branches, formatArabicNumber } from "./brand";
import { menuProducts, type MenuOption, type MenuProduct } from "./menu";

/** Versioned, browser-only data used exclusively by the ordering demonstration. */
export const DEMO_SCHEMA_VERSION = 1 as const;
export const DEMO_STORAGE_KEY = "durat-demo-v1";
export const DEMO_MAX_QUANTITY = 99;
export const DEMO_MAX_LINES = 34;
const MAX_STORAGE_BYTES = 16 * 1024;

export const DEMO_FULFILLMENTS = ["pickup", "delivery"] as const;
export type DemoFulfillment = (typeof DEMO_FULFILLMENTS)[number];

export const DEMO_PAYMENTS = ["apple-pay", "mada", "cash"] as const;
export type DemoPayment = (typeof DEMO_PAYMENTS)[number];

export const DEMO_CUSTOMER = {
  name: "عميل العرض",
  phone: "05XXXXXXXX",
  address: "عنوان تجريبي — لا يستخدم للتوصيل",
} as const;

export interface CartLine {
  productSlug: string;
  optionId: string;
  quantity: number;
}

export interface DemoBranch {
  id: string;
  ordinal: number;
  city: string;
  label: string;
}

/**
 * Deliberately derives labels from incomplete branch records and never exposes
 * a branch name, address, phone number, or other contact data.
 */
export const demoBranches: readonly DemoBranch[] = branches.map(branch => ({
  id: branch.id,
  ordinal: branch.ordinal,
  city: branch.city ?? "",
  label: `فرع تجريبي ${formatArabicNumber(branch.ordinal)}${branch.city ? ` — ${branch.city}` : ""}`,
}));

export interface DemoCartItem {
  line: CartLine;
  product: MenuProduct;
  option: MenuOption;
  totalSar: number;
}

export interface DemoOrder {
  id: string;
  lines: CartLine[];
  branchId: string;
  fulfillment: DemoFulfillment;
  payment: DemoPayment;
  totalSar: number;
  step: 0 | 1 | 2 | 3;
  createdAt: string;
  kind: "demo";
}

export interface DemoPersistedState {
  version: typeof DEMO_SCHEMA_VERSION;
  cart: CartLine[];
  branchId: string | null;
  fulfillment: DemoFulfillment;
  payment: DemoPayment;
  order: DemoOrder | null;
}

export interface CartTotals {
  totalSar: number;
  totalQuantity: number;
}

export interface CartMutation {
  cart: CartLine[];
  changed: boolean;
}

const EMPTY_TOTALS: CartTotals = { totalSar: 0, totalQuantity: 0 };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBoundedString(value: unknown, maxLength = 120): value is string {
  return (
    typeof value === "string" && value.length > 0 && value.length <= maxLength
  );
}

function isSafePositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function cloneLine(line: CartLine): CartLine {
  return {
    productSlug: line.productSlug,
    optionId: line.optionId,
    quantity: line.quantity,
  };
}

function cloneOrder(order: DemoOrder): DemoOrder {
  return {
    id: order.id,
    lines: order.lines.map(cloneLine),
    branchId: order.branchId,
    fulfillment: order.fulfillment,
    payment: order.payment,
    totalSar: order.totalSar,
    step: order.step,
    createdAt: order.createdAt,
    kind: "demo",
  };
}

/** A collision-safe identity for matching a product option, never a price. */
export function cartLineIdentity(
  productSlug: string,
  optionId: string
): string {
  return JSON.stringify([productSlug, optionId]);
}

/** Alias retained for consumers that name the line identity a key. */
export const getCartLineKey = cartLineIdentity;

export function getDemoProductOption(
  productSlug: string,
  optionId: string
): { product: MenuProduct; option: MenuOption } | null {
  if (!isBoundedString(productSlug) || !isBoundedString(optionId)) return null;

  const product = menuProducts.find(
    candidate => candidate.slug === productSlug
  );
  if (!product) return null;

  const option = product.options.find(candidate => candidate.id === optionId);
  if (
    !option ||
    !isSafePositiveInteger(option.priceSar) ||
    !Number.isSafeInteger(option.priceSar)
  ) {
    return null;
  }

  return { product, option };
}

export function isDemoBranchId(value: unknown): value is string {
  return (
    isBoundedString(value) && demoBranches.some(branch => branch.id === value)
  );
}

export function isDemoFulfillment(value: unknown): value is DemoFulfillment {
  return value === "pickup" || value === "delivery";
}

export function isDemoPayment(value: unknown): value is DemoPayment {
  return value === "apple-pay" || value === "mada" || value === "cash";
}

export function isValidCartLine(value: unknown): value is CartLine {
  if (!isRecord(value)) return false;
  const { productSlug, optionId, quantity } = value;
  return (
    isBoundedString(productSlug) &&
    isBoundedString(optionId) &&
    typeof quantity === "number" &&
    Number.isSafeInteger(quantity) &&
    quantity >= 1 &&
    quantity <= DEMO_MAX_QUANTITY &&
    getDemoProductOption(productSlug, optionId) !== null
  );
}

function validCanonicalCart(lines: readonly CartLine[]): CartLine[] | null {
  if (!Array.isArray(lines) || lines.length > DEMO_MAX_LINES) return null;

  const identities = new Set<string>();
  const clean: CartLine[] = [];
  for (const line of lines) {
    if (!isValidCartLine(line)) return null;
    const identity = cartLineIdentity(line.productSlug, line.optionId);
    if (identities.has(identity)) return null;
    identities.add(identity);
    clean.push(cloneLine(line));
  }
  return clean;
}

/**
 * Sanitizes a cart read from storage. It accepts only canonical lines; invalid,
 * duplicate, unknown, or over-limit values are discarded as one unsafe cart.
 */
export function sanitizeCartLines(value: unknown): CartLine[] {
  if (!Array.isArray(value) || value.length > DEMO_MAX_LINES) return [];
  const result = validCanonicalCart(value as CartLine[]);
  return result ?? [];
}

export function addCartLine(
  cart: readonly CartLine[],
  productSlug: string,
  optionId: string,
  quantity: number
): CartMutation {
  const canonical = validCanonicalCart(cart);
  if (
    !canonical ||
    !getDemoProductOption(productSlug, optionId) ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > DEMO_MAX_QUANTITY
  ) {
    return { cart: canonical ?? [], changed: false };
  }

  const identity = cartLineIdentity(productSlug, optionId);
  const index = canonical.findIndex(
    line => cartLineIdentity(line.productSlug, line.optionId) === identity
  );

  if (index === -1) {
    if (canonical.length >= DEMO_MAX_LINES)
      return { cart: canonical, changed: false };
    return {
      cart: [...canonical, { productSlug, optionId, quantity }],
      changed: true,
    };
  }

  const nextQuantity = canonical[index].quantity + quantity;
  if (!Number.isSafeInteger(nextQuantity) || nextQuantity > DEMO_MAX_QUANTITY) {
    return { cart: canonical, changed: false };
  }

  const nextCart = canonical.map((line, lineIndex) =>
    lineIndex === index ? { ...line, quantity: nextQuantity } : line
  );
  return { cart: nextCart, changed: true };
}

export function updateCartLineQuantity(
  cart: readonly CartLine[],
  productSlug: string,
  optionId: string,
  quantity: number
): CartMutation {
  const canonical = validCanonicalCart(cart);
  if (
    !canonical ||
    !getDemoProductOption(productSlug, optionId) ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > DEMO_MAX_QUANTITY
  ) {
    return { cart: canonical ?? [], changed: false };
  }

  const identity = cartLineIdentity(productSlug, optionId);
  const index = canonical.findIndex(
    line => cartLineIdentity(line.productSlug, line.optionId) === identity
  );
  if (index === -1 || canonical[index].quantity === quantity) {
    return { cart: canonical, changed: false };
  }

  return {
    cart: canonical.map((line, lineIndex) =>
      lineIndex === index ? { ...line, quantity } : line
    ),
    changed: true,
  };
}

export function removeCartLine(
  cart: readonly CartLine[],
  productSlug: string,
  optionId: string
): CartMutation {
  const canonical = validCanonicalCart(cart);
  if (!canonical || !getDemoProductOption(productSlug, optionId)) {
    return { cart: canonical ?? [], changed: false };
  }

  const identity = cartLineIdentity(productSlug, optionId);
  const nextCart = canonical.filter(
    line => cartLineIdentity(line.productSlug, line.optionId) !== identity
  );
  return { cart: nextCart, changed: nextCart.length !== canonical.length };
}

export function getDemoCartItems(lines: readonly CartLine[]): DemoCartItem[] {
  const canonical = validCanonicalCart(lines);
  if (!canonical) return [];

  const items: DemoCartItem[] = [];
  for (const line of canonical) {
    const resolved = getDemoProductOption(line.productSlug, line.optionId);
    if (!resolved) return [];
    const totalSar = resolved.option.priceSar * line.quantity;
    if (!Number.isSafeInteger(totalSar) || totalSar < 0) return [];
    items.push({
      line: cloneLine(line),
      product: resolved.product,
      option: resolved.option,
      totalSar,
    });
  }
  return items;
}

/** All money stays as integer SAR and is always recalculated from menu options. */
export function calculateCartTotals(lines: readonly CartLine[]): CartTotals {
  const items = getDemoCartItems(lines);
  if (items.length === 0) return { ...EMPTY_TOTALS };

  let totalSar = 0;
  let totalQuantity = 0;
  for (const item of items) {
    totalSar += item.totalSar;
    totalQuantity += item.line.quantity;
    if (
      !Number.isSafeInteger(totalSar) ||
      !Number.isSafeInteger(totalQuantity)
    ) {
      return { ...EMPTY_TOTALS };
    }
  }
  return { totalSar, totalQuantity };
}

export function createEmptyDemoState(): DemoPersistedState {
  return {
    version: DEMO_SCHEMA_VERSION,
    cart: [],
    branchId: null,
    fulfillment: "pickup",
    payment: "cash",
    order: null,
  };
}

function isSafeDemoOrderId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^DEMO-[A-Za-z0-9-]{1,96}$/.test(value) &&
    value.length <= 101
  );
}

function isDemoStep(value: unknown): value is 0 | 1 | 2 | 3 {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 3
  );
}

function isSafeCreatedAt(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 20 &&
    value.length <= 40 &&
    Number.isFinite(Date.parse(value))
  );
}

/** Revalidates the order snapshot and recalculates its total from today's catalog. */
export function sanitizeDemoOrder(value: unknown): DemoOrder | null {
  if (!isRecord(value)) return null;

  const { id, lines, branchId, fulfillment, payment, step, createdAt, kind } =
    value;
  if (
    !isSafeDemoOrderId(id) ||
    !Array.isArray(lines) ||
    !isDemoBranchId(branchId) ||
    !isDemoFulfillment(fulfillment) ||
    !isDemoPayment(payment) ||
    !isDemoStep(step) ||
    !isSafeCreatedAt(createdAt) ||
    kind !== "demo"
  ) {
    return null;
  }

  const safeLines = validCanonicalCart(lines as CartLine[]);
  if (!safeLines || safeLines.length === 0) return null;

  const { totalSar } = calculateCartTotals(safeLines);
  if (!Number.isSafeInteger(totalSar) || totalSar <= 0) return null;

  return {
    id,
    lines: safeLines,
    branchId,
    fulfillment,
    payment,
    totalSar,
    step,
    createdAt,
    kind: "demo",
  };
}

/**
 * Reads only a narrow version-1 schema. Unknown nested data is never traversed
 * or copied, and an unsafe envelope resolves to an empty demo state.
 */
export function sanitizeDemoState(value: unknown): DemoPersistedState {
  if (!isRecord(value) || value.version !== DEMO_SCHEMA_VERSION) {
    return createEmptyDemoState();
  }

  const cart = sanitizeCartLines(value.cart);
  const branchId = isDemoBranchId(value.branchId) ? value.branchId : null;
  const fulfillment = isDemoFulfillment(value.fulfillment)
    ? value.fulfillment
    : "pickup";
  const payment = isDemoPayment(value.payment) ? value.payment : "cash";
  const order = sanitizeDemoOrder(value.order);

  return {
    version: DEMO_SCHEMA_VERSION,
    cart,
    branchId,
    fulfillment,
    payment,
    order,
  };
}

export function parseDemoStorage(raw: unknown): DemoPersistedState {
  if (
    typeof raw !== "string" ||
    raw.length === 0 ||
    raw.length > MAX_STORAGE_BYTES
  ) {
    return createEmptyDemoState();
  }

  try {
    return sanitizeDemoState(JSON.parse(raw) as unknown);
  } catch {
    return createEmptyDemoState();
  }
}

export interface DemoStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function browserStorage(): DemoStorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readDemoStorage(
  storage: Pick<DemoStorageLike, "getItem"> | null = browserStorage()
): DemoPersistedState {
  if (!storage) return createEmptyDemoState();
  try {
    return parseDemoStorage(storage.getItem(DEMO_STORAGE_KEY));
  } catch {
    return createEmptyDemoState();
  }
}

/** Serializes only cart/order simulation data; DEMO_CUSTOMER is never persisted. */
export function serializeDemoState(state: DemoPersistedState): string {
  const safe = sanitizeDemoState(state);
  return JSON.stringify({
    version: DEMO_SCHEMA_VERSION,
    cart: safe.cart,
    branchId: safe.branchId,
    fulfillment: safe.fulfillment,
    payment: safe.payment,
    order: safe.order,
  });
}

export function writeDemoStorage(
  state: DemoPersistedState,
  storage: Pick<DemoStorageLike, "setItem"> | null = browserStorage()
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(DEMO_STORAGE_KEY, serializeDemoState(state));
    return true;
  } catch {
    return false;
  }
}

export function generateDemoOrderId(
  now = Date.now(),
  random = Math.random()
): string {
  const safeNow = Number.isSafeInteger(now) && now >= 0 ? now : 0;
  const safeRandom = Number.isFinite(random)
    ? Math.min(Math.max(random, 0), 0.9999999999999999)
    : 0;
  return `DEMO-${safeNow.toString(36)}-${Math.floor(safeRandom * 0x100000000)
    .toString(36)
    .padStart(7, "0")}`;
}

export function createDemoOrder(
  state: Pick<
    DemoPersistedState,
    "cart" | "branchId" | "fulfillment" | "payment"
  >,
  id = generateDemoOrderId(),
  createdAt = new Date().toISOString()
): DemoOrder | null {
  const lines = validCanonicalCart(state.cart);
  if (
    !lines ||
    lines.length === 0 ||
    !isDemoBranchId(state.branchId) ||
    !isDemoFulfillment(state.fulfillment) ||
    !isDemoPayment(state.payment) ||
    !isSafeDemoOrderId(id) ||
    !isSafeCreatedAt(createdAt)
  ) {
    return null;
  }

  const { totalSar } = calculateCartTotals(lines);
  if (!Number.isSafeInteger(totalSar) || totalSar <= 0) return null;

  return {
    id,
    lines: lines.map(cloneLine),
    branchId: state.branchId,
    fulfillment: state.fulfillment,
    payment: state.payment,
    totalSar,
    step: 0,
    createdAt,
    kind: "demo",
  };
}

export function advanceDemoOrder(order: DemoOrder | null): DemoOrder | null {
  const safeOrder = sanitizeDemoOrder(order);
  if (!safeOrder) return null;
  return {
    ...cloneOrder(safeOrder),
    step: Math.min(safeOrder.step + 1, 3) as DemoOrder["step"],
  };
}
