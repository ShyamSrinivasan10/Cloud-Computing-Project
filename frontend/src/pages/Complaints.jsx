import React, { useState, useEffect } from 'react'
import { Search, Plus, Eye, MessageSquare, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { apiClient } from '../api'

const Complaints = () => {
  const [complaints, setComplaints] = useState([])
  const [filteredComplaints, setFilteredComplaints] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get('/api/complaints/')
      setComplaints(data)
      setFilteredComplaints(data)
    } catch (error) {
      console.error("Error fetching complaints: ", error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  useEffect(() => {
    let filtered = complaints
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === filterStatus)
    }
    if (filterPriority !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === filterPriority)
    }
    setFilteredComplaints(filtered)
  }, [complaints, searchTerm, filterStatus, filterPriority])

  const handleStatusChange = async (complaintId, newStatus) => {
    const complaintToUpdate = complaints.find(c => c.id === complaintId)
    const updatedComplaint = {
      ...complaintToUpdate,
      status: newStatus,
      dateResolved: newStatus === 'resolved' ? new Date().toISOString().split('T')[0] : null
    }

    try {
      const savedComplaint = await apiClient.put(`/api/complaints/${complaintId}/`, { body: updatedComplaint })
      setComplaints(complaints.map(c => c.id === complaintId ? savedComplaint : c))
    } catch (error) {
      console.error("Error updating complaint status: ", error)
      alert(`Failed to update complaint status: ${error.message}`)
    }
  }

  const handleSaveComplaint = async (complaintData) => {
    try {
      await apiClient.post('/api/complaints/', { body: complaintData })
      await fetchComplaints() // Refetch to get the latest list
      setShowAddModal(false)
    } catch (error) {
      console.error("Error saving complaint: ", error)
      alert(`Failed to save complaint: ${error.message}`)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />
      case 'in-progress': return <AlertTriangle size={16} />
      case 'resolved': return <CheckCircle size={16} />
      default: return <MessageSquare size={16} />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  if (loading) {
    return <div className="loading-message">Loading complaints...</div>
  }

  if (error) {
    return <div className="error-message">Error: {error.message}</div>
  }

  return (
    <div className="complaints-page">
      <div className="page-header">
        <h1>Complaints Management</h1>
        <button className="btn primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Add Complaint
        </button>
      </div>

      <div className="filters-section">
        {/* ... filters ... */}
      </div>

      <div className="complaints-list">
        {filteredComplaints.map((complaint) => (
          <div key={complaint.id} className="complaint-card">
            <div className="complaint-header">
              <div className="complaint-title">
                <h3>{complaint.title}</h3>
                <div className="complaint-meta">
                  <span className="student-info">{complaint.studentName} - Room {complaint.roomNumber}</span>
                  <span className="date">{new Date(complaint.dateSubmitted).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="complaint-badges">
                <span className={`priority ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</span>
                <span className={`status ${complaint.status}`}>{getStatusIcon(complaint.status)}{complaint.status}</span>
              </div>
            </div>
            <div className="complaint-body">
              <p>{complaint.description}</p>
              <div className="complaint-details">
                <div className="detail-item"><strong>Category:</strong> {complaint.category}</div>
                <div className="detail-item"><strong>Assigned to:</strong> {complaint.assignedTo}</div>
                {complaint.dateResolved && (
                  <div className="detail-item"><strong>Resolved on:</strong> {new Date(complaint.dateResolved).toLocaleDateString()}</div>
                )}
              </div>
            </div>
            <div className="complaint-actions">
              <button className="btn-icon view" title="View Details"><Eye size={16} /></button>
              {complaint.status !== 'resolved' && (
                <div className="status-actions">
                  {complaint.status === 'pending' && (
                    <button className="btn small secondary" onClick={() => handleStatusChange(complaint.id, 'in-progress')}>Start Progress</button>
                  )}
                  {complaint.status === 'in-progress' && (
                    <button className="btn small success" onClick={() => handleStatusChange(complaint.id, 'resolved')}>Mark Resolved</button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <ComplaintModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveComplaint}
        />
      )}
    </div>
  )
}

const ComplaintModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    studentName: '',
    roomNumber: '',
    category: '',
    priority: 'medium',
    assignedTo: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add New Complaint</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Form fields remain the same */}
        </form>
      </div>
    </div>
  )
}

export default Complaints
