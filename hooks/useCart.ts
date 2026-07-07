"use client";

import { useState, useEffect } from "react";

export interface CartItem {
  produceId: string;
  name: string;
  price: number;
  quantity: number;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 1. Initial load from local storage
  useEffect(() => {
    const loadCart = () => {
      try {
        const stored = localStorage.getItem("farmlink_cart");
        if (stored) {
          setCartItems(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to load cart from localStorage:", err);
      }
    };

    loadCart();

    // Listen for storage events (multi-tab sync) and our custom event
    const handleUpdate = () => {
      loadCart();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("farmlink_cart_updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("farmlink_cart_updated", handleUpdate);
    };
  }, []);

  // Helper to save state
  const saveCart = (items: CartItem[]) => {
    try {
      localStorage.setItem("farmlink_cart", JSON.stringify(items));
      setCartItems(items);
      window.dispatchEvent(new Event("farmlink_cart_updated"));
    } catch (err) {
      console.error("Failed to save cart to localStorage:", err);
    }
  };

  const addToCart = (newItem: Omit<CartItem, "quantity">) => {
    const existingIdx = cartItems.findIndex((item) => item.produceId === newItem.produceId);
    let updated = [...cartItems];

    if (existingIdx > -1) {
      updated[existingIdx].quantity += 1;
    } else {
      updated.push({ ...newItem, quantity: 1 });
    }

    saveCart(updated);
  };

  const removeFromCart = (produceId: string) => {
    const updated = cartItems.filter((item) => item.produceId !== produceId);
    saveCart(updated);
  };

  const updateQuantity = (produceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(produceId);
      return;
    }
    const updated = cartItems.map((item) =>
      item.produceId === produceId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
