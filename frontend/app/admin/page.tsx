"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, CheckCircle, ChefHat, Settings, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context" // Assuming you have an auth context

interface Order {
  id: number
  table_number: number
  notes: string | null
  items_summary: string // From the backend query
  total: number
  status: "pending" | "cooking" | "completed" | "cancelled"
  created_at: string
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  // const { token } = useAuth() // Uncomment if you implement auth

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getOrders()
      setOrders(data)
    } catch (err) {
      setError("Gagal memuat pesanan. Coba muat ulang halaman.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: number, newStatus: Order["status"]) => {
    try {
      // You'll need a token if the endpoint is protected
      // await api.updateOrderStatus(orderId, newStatus, token)
      await api.updateOrderStatus(orderId, newStatus, "dummy-token") // Replace with real token
      fetchOrders() // Refresh orders after update
    } catch (err) {
      alert("Gagal memperbarui status pesanan.")
      console.error(err)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "cooking":
        return <ChefHat className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "cooking":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
    }
  }

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Menunggu"
      case "cooking":
        return "Dimasak"
      case "completed":
        return "Selesai"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Memuat pesanan...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Terjadi Kesalahan</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchOrders}>Coba Lagi</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Admin</h1>
                <p className="text-gray-600">Kelola pesanan dan menu restoran</p>
              </div>
            </div>
            <Button onClick={() => router.push("/admin/menu")} className="bg-orange-600 hover:bg-orange-700">
              <Settings className="h-4 w-4 mr-2" />
              Kelola Menu
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Dimasak</p>
                  <p className="text-2xl font-bold">{orders.filter((o) => o.status === "cooking").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold">{orders.filter((o) => o.status === "completed").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-orange-500 rounded-full" />
                <div>
                  <p className="text-sm text-gray-600">Total Pesanan</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Daftar Pesanan</h2>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold mb-2">Belum Ada Pesanan</h3>
                <p className="text-gray-600">Pesanan akan muncul di sini setelah pelanggan memesan</p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span>Meja {order.table_number}</span>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusText(order.status)}</span>
                      </Badge>
                    </CardTitle>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString("id-ID")}</p>
                      <p className="font-semibold text-orange-600">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-semibold mb-2">Pesanan:</h4>
                    <p className="text-sm text-gray-700">{order.items_summary}</p>
                  </div>
                  {order.notes && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">Catatan:</h4>
                      <p className="text-sm text-gray-600 italic">"{order.notes}"</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <Select
                      value={order.status}
                      onValueChange={(newStatus) => handleUpdateStatus(order.id, newStatus as Order['status'])}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Ubah Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="cooking">Dimasak</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
