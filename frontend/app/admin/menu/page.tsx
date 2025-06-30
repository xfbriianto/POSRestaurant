"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category_id: number
  category_name: string
  image_url: string
}

interface Category {
  id: number
  name: string
}

export default function AdminMenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_url: "",
  })
  const router = useRouter()

  useEffect(() => {
    fetchMenu()
    fetchCategories()
  }, [])

  const fetchMenu = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/menu")
      const data = await response.json()
      setMenu(data)
    } catch (error) {
      console.error("Failed to fetch menu:", error)
      // Optionally show an error message to the user
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.price || !formData.category_id) {
      alert("Mohon lengkapi semua field yang wajib diisi")
      return
    }

    const menuItemData = {
      name: formData.name,
      description: formData.description,
      price: Number.parseInt(formData.price),
      category_id: Number.parseInt(formData.category_id),
      image_url: formData.image_url || "/placeholder.svg?height=200&width=300",
    }

    try {
      console.log('Submitting menu item:', menuItemData)
      console.log('Editing item:', editingItem)

      let response
      if (editingItem) {
        response = await fetch(`http://localhost:3001/api/menu/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(menuItemData),
        })
      } else {
        response = await fetch("http://localhost:3001/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(menuItemData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save menu item")
      }

      const savedItem = await response.json()
      console.log('Saved item:', savedItem)

      await fetchMenu()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving menu item:", error)
      alert(`Gagal menyimpan menu: ${error.message}`)
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category_id: item.category_id.toString(),
      image_url: item.image_url,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
      try {
        const response = await fetch(`http://localhost:3001/api/menu/${id}`, {
          method: "DELETE",
        })
        if (!response.ok) {
          throw new Error("Failed to delete menu item")
        }
        await fetchMenu() // Refresh menu
      } catch (error) {
        console.error("Error deleting menu item:", error)
        alert("Gagal menghapus menu.")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category_id: "",
      image_url: "",
    })
    setEditingItem(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const groupedMenu = menu.reduce(
    (acc, item) => {
      if (!acc[item.category_name]) {
        acc[item.category_name] = []
      }
      acc[item.category_name].push(item)
      return acc
    },
    {} as Record<string, MenuItem[]>,
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading menu...</p>
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
              <Button variant="ghost" size="icon" onClick={() => router.push("/admin")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Kelola Menu</h1>
                <p className="text-gray-600">Tambah, edit, dan hapus menu restoran</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Menu
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Menu" : "Tambah Menu Baru"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Menu *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Nasi Gudeg"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Deskripsi menu..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Harga (Rp) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="25000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Kategori *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="image">URL Gambar (Opsional)</Label>
                    <Input
                      id="image"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                      {editingItem ? "Update Menu" : "Tambah Menu"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                      Batal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-orange-500 rounded-full" />
                <div>
                  <p className="text-sm text-gray-600">Total Menu</p>
                  <p className="text-2xl font-bold">{menu.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-600">{category.name}</p>
                    <p className="text-2xl font-bold">{menu.filter((item) => item.category_id === category.id).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Menu by Category */}
        <div className="space-y-6">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-200">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold text-orange-600">{formatPrice(item.price)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {menu.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-lg font-semibold mb-2">Belum Ada Menu</h3>
              <p className="text-gray-600 mb-4">Mulai dengan menambahkan menu pertama Anda</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Menu
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


