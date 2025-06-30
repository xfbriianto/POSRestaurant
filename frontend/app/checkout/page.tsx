"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { api } from "@/lib/api"

export default function CheckoutPage() {
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { cartItems, getTotalPrice, tableNumber, clearCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)

    const orderData = {
      table_number: tableNumber,
      notes,
      items: cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      total: getTotalPrice(),
    }

    try {
      await api.createOrder(orderData)
      clearCart()
      router.push("/success")
    } catch (error) {
      console.error("Error submitting order:", error)
      alert("Gagal mengirim pesanan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/cart")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Checkout</h1>
              <p className="text-sm text-gray-600">Meja {tableNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity}x {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Contoh: tanpa sambal, extra pedas, dll."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Informasi Pesanan</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Nomor Meja:</span> {tableNumber}
                  </p>
                  <p>
                    <span className="font-medium">Total Item:</span>{" "}
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                  <p>
                    <span className="font-medium">Total Harga:</span> {formatPrice(getTotalPrice())}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? "Mengirim Pesanan..." : "Kirim Pesanan"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
