const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// API utility functions
export const api = {
  // Menu endpoints
  async getMenu() {
    const response = await fetch(`${API_BASE_URL}/menu`)
    if (!response.ok) throw new Error("Failed to fetch menu")
    return response.json()
  },

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`)
    if (!response.ok) throw new Error("Failed to fetch categories")
    return response.json()
  },

  // Orders endpoints
  async createOrder(orderData: any) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
    if (!response.ok) throw new Error("Failed to create order")
    return response.json()
  },

  async getOrders(filters?: { status?: string; table_number?: number }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.table_number) params.append("table_number", filters.table_number.toString())

    const response = await fetch(`${API_BASE_URL}/orders?${params}`)
    if (!response.ok) throw new Error("Failed to fetch orders")
    return response.json()
  },

  async updateOrderStatus(orderId: number, status: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) throw new Error("Failed to update order status")
    return response.json()
  },

  // Admin endpoints
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
    if (!response.ok) throw new Error("Login failed")
    return response.json()
  },

  async createMenuItem(menuData: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(menuData),
    })
    if (!response.ok) throw new Error("Failed to create menu item")
    return response.json()
  },

  async updateMenuItem(id: number, menuData: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(menuData),
    })
    if (!response.ok) throw new Error("Failed to update menu item")
    return response.json()
  },

  async deleteMenuItem(id: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error("Failed to delete menu item")
    return response.json()
  },

  async getDashboardStats(token: string) {
    const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error("Failed to fetch dashboard stats")
    return response.json()
  },
}
