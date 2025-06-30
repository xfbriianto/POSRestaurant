"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { api } from "@/lib/api"

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const router = useRouter()
  const { addToCart, cartItems, tableNumber } = useCart()

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/menu")
      if (!response.ok) {
        throw new Error("Failed to fetch menu items")
      }
      const data = await response.json()
      setMenuItems(data)
    } catch (err) {
      setError("Error loading menu items")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading menu items...</div>
  if (error) return <div>Error: {error}</div>

  const categories = ["Semua", ...Array.from(new Set(menuItems.map((item) => item.category)))]

  const filteredMenu = selectedCategory === "Semua" ? menuItems : menuItems.filter((item) => item.category === selectedCategory)

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Menu Restoran</h1>
                <p className="text-sm text-gray-600">Meja {tableNumber}</p>
              </div>
            </div>
            <Button onClick={() => router.push("/cart")} className="relative bg-orange-600 hover:bg-orange-700">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Keranjang
              {totalItems > 0 && <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">{totalItems}</Badge>}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.image_url && (
                <div className="w-full h-48 overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-orange-600">{formatPrice(item.price)}</span>
                  <Button onClick={() => addToCart(item)} size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
