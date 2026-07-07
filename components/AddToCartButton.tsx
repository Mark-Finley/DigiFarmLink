"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";

interface AddToCartButtonProps {
  produceId: string;
  price: number;
  name: string;
}

export default function AddToCartButton({ produceId, price, name }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (added) {
      const timer = setTimeout(() => setAdded(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [added]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page if nested
    e.stopPropagation();

    try {
      // Get current cart
      const existingCartStr = localStorage.getItem("farmlink_cart") || "[]";
      let cart = JSON.parse(existingCartStr);

      // Check if item already in cart
      const existingItemIdx = cart.findIndex((item: any) => item.produceId === produceId);

      if (existingItemIdx > -1) {
        cart[existingItemIdx].quantity += 1;
      } else {
        cart.push({
          produceId,
          name,
          price,
          quantity: 1,
        });
      }

      // Save back to local storage
      localStorage.setItem("farmlink_cart", JSON.stringify(cart));
      
      // Dispatch custom event to notify Navbar/other components of cart changes
      window.dispatchEvent(new Event("farmlink_cart_updated"));

      setAdded(true);
    } catch (err) {
      console.error("Failed to add item to cart:", err);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
        added
          ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
          : "bg-primary text-primary-foreground hover:bg-primary/95 border-primary hover:shadow-md"
      }`}
    >
      {added ? (
        <>
          <Check className="h-3.5 w-3.5" />
          <span>Added!</span>
        </>
      ) : (
        <>
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
}
