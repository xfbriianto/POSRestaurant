"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"

export default function HomePage() {
  const [tableNumber, setTableNumber] = useState("")
  const router = useRouter()
  const { setTableNumber: setCartTableNumber } = useCart()

  const handleTableSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tableNumber && Number.parseInt(tableNumber) >= 1 && Number.parseInt(tableNumber) <= 10) {
      setCartTableNumber(Number.parseInt(tableNumber))
      localStorage.setItem("tableNumber", tableNumber)
      router.push("/menu")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-orange-600">🍽️ Restoran Nusantara</CardTitle>
          <CardDescription>Selamat datang! Silakan masukkan nomor meja Anda untuk mulai memesan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTableSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="table">Nomor Meja (1-10)</Label>
              <Input
                id="table"
                type="number"
                min="1"
                max="10"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Masukkan nomor meja"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
              Mulai Pesan
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t">
            <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/admin")}>
              🔐 Admin Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
