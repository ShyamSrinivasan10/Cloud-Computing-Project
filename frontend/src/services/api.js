// API service for communicating with Django backend
const API_BASE_URL = '/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication
  async login(credentials) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  async logout() {
    return this.request('/auth/logout/', {
      method: 'POST'
    })
  }

  // Students
  async getStudents() {
    return this.request('/students/')
  }

  async getStudent(id) {
    return this.request(`/students/${id}/`)
  }

  async createStudent(studentData) {
    return this.request('/students/', {
      method: 'POST',
      body: JSON.stringify(studentData)
    })
  }

  async updateStudent(id, studentData) {
    return this.request(`/students/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    })
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}/`, {
      method: 'DELETE'
    })
  }

  // Rooms
  async getRooms() {
    return this.request('/rooms/')
  }

  async getRoom(id) {
    return this.request(`/rooms/${id}/`)
  }

  async createRoom(roomData) {
    return this.request('/rooms/', {
      method: 'POST',
      body: JSON.stringify(roomData)
    })
  }

  async updateRoom(id, roomData) {
    return this.request(`/rooms/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    })
  }

  async assignRoom(roomId, studentId) {
    return this.request(`/rooms/${roomId}/assign/`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId })
    })
  }

  // Complaints
  async getComplaints() {
    return this.request('/complaints/')
  }

  async getComplaint(id) {
    return this.request(`/complaints/${id}/`)
  }

  async createComplaint(complaintData) {
    return this.request('/complaints/', {
      method: 'POST',
      body: JSON.stringify(complaintData)
    })
  }

  async updateComplaint(id, complaintData) {
    return this.request(`/complaints/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(complaintData)
    })
  }

  async updateComplaintStatus(id, status) {
    return this.request(`/complaints/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  }

  // Fees
  async getFeeRecords() {
    return this.request('/fees/')
  }

  async getFeeRecord(id) {
    return this.request(`/fees/${id}/`)
  }

  async createFeeRecord(feeData) {
    return this.request('/fees/', {
      method: 'POST',
      body: JSON.stringify(feeData)
    })
  }

  async recordPayment(feeId, paymentData) {
    return this.request(`/fees/${feeId}/payment/`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    })
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats/')
  }

  async getRecentActivities() {
    return this.request('/dashboard/activities/')
  }
}

export default new ApiService()