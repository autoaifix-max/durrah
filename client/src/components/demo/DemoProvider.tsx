"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addCartLine,
  advanceDemoOrder,
  calculateCartTotals,
  createDemoOrder,
  createEmptyDemoState,
  getDemoCartItems,
  isDemoBranchId,
  isDemoFulfillment,
  isDemoPayment,
  readDemoStorage,
  removeCartLine,
  sanitizeDemoOrder,
  sanitizeDemoState,
  updateCartLineQuantity,
  writeDemoStorage,
  type CartLine,
  type DemoCartItem,
  type DemoFulfillment,
  type DemoOrder,
  type DemoPayment,
  type DemoPersistedState,
} from "@/data/demo";
import type { MenuOption, MenuProduct } from "@/data/menu";

export interface DemoContextValue {
  cart: CartLine[];
  items: Array<{
    line: CartLine;
    product: MenuProduct;
    option: MenuOption;
    totalSar: number;
  }>;
  totalSar: number;
  totalQuantity: number;
  branchId: string | null;
  fulfillment: DemoFulfillment;
  payment: DemoPayment;
  order: DemoOrder | null;
  hydrated: boolean;
  addItem(slug: string, optionId: string, quantity: number): boolean;
  updateQuantity(slug: string, optionId: string, quantity: number): void;
  removeItem(slug: string, optionId: string): void;
  clearCart(): void;
  setBranchId(value: string): void;
  setFulfillment(value: DemoFulfillment): void;
  setPayment(value: DemoPayment): void;
  placeOrder(): DemoOrder | null;
  advanceOrder(): void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function publicCart(cart: readonly CartLine[]): CartLine[] {
  return cart.map(line => ({
    productSlug: line.productSlug,
    optionId: line.optionId,
    quantity: line.quantity,
  }));
}

/**
 * DemoProvider has no server calls: it starts with a deterministic empty SSR
 * state, then reads versioned localStorage after hydration when available.
 */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoPersistedState>(() =>
    createEmptyDemoState()
  );
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef<DemoPersistedState>(state);
  const placingRef = useRef(false);

  const commit = useCallback((next: DemoPersistedState) => {
    const safe = sanitizeDemoState(next);
    stateRef.current = safe;
    setState(safe);
    writeDemoStorage(safe);
  }, []);

  useEffect(() => {
    const loaded = readDemoStorage();
    stateRef.current = loaded;
    setState(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeDemoStorage(state);
  }, [hydrated, state]);

  const addItem = useCallback(
    (slug: string, optionId: string, quantity: number): boolean => {
      const current = stateRef.current;
      const mutation = addCartLine(current.cart, slug, optionId, quantity);
      if (!mutation.changed) return false;
      commit({ ...current, cart: mutation.cart });
      return true;
    },
    [commit]
  );

  const updateQuantity = useCallback(
    (slug: string, optionId: string, quantity: number): void => {
      const current = stateRef.current;
      const mutation = updateCartLineQuantity(
        current.cart,
        slug,
        optionId,
        quantity
      );
      if (mutation.changed) commit({ ...current, cart: mutation.cart });
    },
    [commit]
  );

  const removeItem = useCallback(
    (slug: string, optionId: string): void => {
      const current = stateRef.current;
      const mutation = removeCartLine(current.cart, slug, optionId);
      if (mutation.changed) commit({ ...current, cart: mutation.cart });
    },
    [commit]
  );

  const clearCart = useCallback((): void => {
    const current = stateRef.current;
    if (current.cart.length > 0) commit({ ...current, cart: [] });
  }, [commit]);

  const setBranchId = useCallback(
    (value: string): void => {
      const current = stateRef.current;
      const branchId = isDemoBranchId(value) ? value : null;
      if (current.branchId !== branchId) commit({ ...current, branchId });
    },
    [commit]
  );

  const setFulfillment = useCallback(
    (value: DemoFulfillment): void => {
      if (!isDemoFulfillment(value)) return;
      const current = stateRef.current;
      if (current.fulfillment !== value)
        commit({ ...current, fulfillment: value });
    },
    [commit]
  );

  const setPayment = useCallback(
    (value: DemoPayment): void => {
      if (!isDemoPayment(value)) return;
      const current = stateRef.current;
      if (current.payment !== value) commit({ ...current, payment: value });
    },
    [commit]
  );

  const placeOrder = useCallback((): DemoOrder | null => {
    if (placingRef.current) return null;
    placingRef.current = true;
    try {
      const current = stateRef.current;
      const order = createDemoOrder(current);
      if (!order) return null;

      // Commit synchronously through the ref before React batches a re-render.
      // A fast second click therefore sees an empty cart and cannot duplicate it.
      commit({ ...current, cart: [], order });
      return order;
    } finally {
      placingRef.current = false;
    }
  }, [commit]);

  const advanceOrder = useCallback((): void => {
    const current = stateRef.current;
    const nextOrder = advanceDemoOrder(current.order);
    if (!nextOrder || nextOrder.step === current.order?.step) return;
    commit({ ...current, order: nextOrder });
  }, [commit]);

  const cart = useMemo(() => publicCart(state.cart), [state.cart]);
  const items = useMemo<DemoCartItem[]>(
    () => getDemoCartItems(state.cart),
    [state.cart]
  );
  const totals = useMemo(() => calculateCartTotals(state.cart), [state.cart]);
  const order = useMemo(() => sanitizeDemoOrder(state.order), [state.order]);

  const value = useMemo<DemoContextValue>(
    () => ({
      cart,
      items,
      totalSar: totals.totalSar,
      totalQuantity: totals.totalQuantity,
      branchId: state.branchId,
      fulfillment: state.fulfillment,
      payment: state.payment,
      order,
      hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setBranchId,
      setFulfillment,
      setPayment,
      placeOrder,
      advanceOrder,
    }),
    [
      addItem,
      advanceOrder,
      cart,
      clearCart,
      hydrated,
      items,
      order,
      placeOrder,
      removeItem,
      setBranchId,
      setFulfillment,
      setPayment,
      state.branchId,
      state.fulfillment,
      state.payment,
      totals.totalQuantity,
      totals.totalSar,
      updateQuantity,
    ]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider required");
  return context;
}

export default DemoProvider;
