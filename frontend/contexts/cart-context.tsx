"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
}

interface CartItem extends MenuItem {
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  tableNumber: number | null
  addToCart: (item: MenuItem) => void
  removeFromCart: (itemId: number) => void
  updateQuantity: (itemId: number, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  setTableNumber: (tableNumber: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [tableNumber, setTableNumberState] = useState<number | null>(null)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }

    // Load table number from localStorage
    const savedTableNumber = localStorage.getItem("tableNumber")
    if (savedTableNumber) {
      setTableNumberState(Number.parseInt(savedTableNumber))
    }
  }, [])

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item: MenuItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.id === item.id)

      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      } else {
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (itemId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCartItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("cart")
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const setTableNumber = (tableNumber: number) => {
    setTableNumberState(tableNumber)
    localStorage.setItem("tableNumber", tableNumber.toString())
  }

  const value: CartContextType = {
    cartItems,
    tableNumber,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    setTableNumber,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
