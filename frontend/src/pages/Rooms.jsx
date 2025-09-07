import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Eye, Filter, Users, Bed } from 'lucide-react'
import { apiClient } from '../api'

const Rooms = () => {
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterFloor, setFilterFloor] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get('/api/rooms/')
      setRooms(data)
      setFilteredRooms(data)
    } catch (error) {
      console.error("Error fetching rooms: ", error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    let filtered = rooms
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.students && room.students.some(student => 
          student.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      )
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(room => room.status === filterStatus)
    }
    if (filterFloor !== 'all') {
      filtered = filtered.filter(room => room.floor.toString() === filterFloor)
    }
    setFilteredRooms(filtered)
  }, [rooms, searchTerm, filterStatus, filterFloor])

  const handleAddRoom = () => {
    setSelectedRoom(null)
    setShowModal(true)
  }

  const handleEditRoom = (room) => {
    setSelectedRoom(room)
    setShowModal(true)
  }

  const handleSaveRoom = async (roomData) => {
    try {
      if (selectedRoom) {
        await apiClient.put(`/api/rooms/${selectedRoom.id}/`, { body: roomData })
      } else {
        await apiClient.post('/api/rooms/', { body: roomData })
      }
      await fetchRooms() // Refetch all rooms to get the latest data
      setShowModal(false)
    } catch (error) {
      console.error("Error saving room: ", error)
      alert(`Failed to save room: ${error.message}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return 'red'
      case 'available': return 'green'
      case 'maintenance': return 'orange'
      default: return 'gray'
    }
  }

  if (loading) {
    return <div className="loading-message">Loading rooms...</div>
  }

  if (error) {
    return <div className="error-message">Error: {error.message}</div>
  }

  return (
    <div className="rooms-page">
      <div className="page-header">
        <h1>Room Management</h1>
        <button className="btn primary" onClick={handleAddRoom}>
          <Plus size={20} />
          Add Room
        </button>
      </div>

      <div className="filters-section">
        {/* Filters remain the same */}
      </div>

      <div className="rooms-grid">
        {filteredRooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <h3>Room {room.roomNumber}</h3>
                <span className={`status ${getStatusColor(room.status)}`}>
                  {room.status}
                </span>
              </div>

              <div className="room-info">
                <div className="info-item">
                  <Bed size={16} />
                  <span>{room.type} Room</span>
                </div>
                <div className="info-item">
                  <Users size={16} />
                  <span>{room.occupied}/{room.capacity} Occupied</span>
                </div>
                <div className="info-item">
                  <span className="rent">₹{room.rent ? room.rent.toLocaleString() : 'N/A'}/month</span>
                </div>
              </div>

              <div className="room-actions">
                <button className="btn-icon view" title="View Details">
                  <Eye size={16} />
                </button>
                <button className="btn-icon edit" title="Edit Room" onClick={() => handleEditRoom(room)}>
                  <Edit size={16} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {showModal && (
        <RoomModal
          room={selectedRoom}
          onClose={() => setShowModal(false)}
          onSave={handleSaveRoom}
        />
      )}

      <div className="rooms-summary">
        {/* ... summary content ... */}
      </div>
    </div>
  )
}

const RoomModal = ({ room, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    capacity: '',
    type: 'Single',
    status: 'available',
    rent: '',
    amenities: '',
  })

  useEffect(() => {
    if (room) {
      setFormData(room)
    } else {
      setFormData({
        roomNumber: '',
        floor: '',
        capacity: '',
        type: 'Single',
        status: 'available',
        rent: '',
        amenities: '',
      })
    }
  }, [room])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{room ? 'Edit Room' : 'Add New Room'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Form fields remain the same */}
          <div className="form-row">
            <div className="form-group">
              <label>Room Number *</label>
              <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Floor *</label>
              <input type="number" name="floor" value={formData.floor} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Capacity *</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Rent (Monthly) *</label>
              <input type="number" name="rent" value={formData.rent} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Amenities</label>
            <input type="text" name="amenities" value={formData.amenities} onChange={handleChange} placeholder="e.g., AC, Geyser, Balcony" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary">{room ? 'Update' : 'Add'} Room</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Rooms
