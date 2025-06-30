"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"

export default function SuccessPage() {
  const router = useRouter()
  const { tableNumber } = useCart()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Pesanan Berhasil!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800 font-semibold">Pesanan dari Meja {tableNumber} telah dikirim!</p>
          </div>

          <p className="text-gray-600">Terima kasih telah memesan. Pesanan Anda sedang diproses oleh dapur.</p>

          <div className="space-y-2">
            <Button onClick={() => router.push("/menu")} className="w-full bg-orange-600 hover:bg-orange-700">
              Pesan Lagi
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
