import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react'
import { apiClient } from '../api'

const Students = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get('/api/students/')
      setStudents(data)
      setFilteredStudents(data)
    } catch (error) {
      console.error("Error fetching students: ", error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    let filtered = students
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(student => student.status === filterStatus)
    }
    setFilteredStudents(filtered)
  }, [students, searchTerm, filterStatus])

  const handleAddStudent = () => {
    setSelectedStudent(null)
    setShowAddModal(true)
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setShowAddModal(true)
  }

  const handleSaveStudent = async (studentData) => {
    try {
      let savedStudent
      if (selectedStudent) {
        savedStudent = await apiClient.put(`/api/students/${selectedStudent.id}/`, { body: studentData })
      } else {
        savedStudent = await apiClient.post('/api/students/', { body: studentData })
      }
      await fetchStudents() // Refetch to get the latest list
      setShowAddModal(false)
    } catch (error) {
      console.error("Error saving student: ", error)
      alert(`Failed to save student: ${error.message}`)
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await apiClient.delete(`/api/students/${studentId}/`)
        await fetchStudents() // Refetch to get the latest list
      } catch (error) {
        console.error("Error deleting student: ", error)
        alert(`Failed to delete student: ${error.message}`)
      }
    }
  }

  if (loading) {
    return <div className="loading-message">Loading students...</div>
  }

  if (error) {
    return <div className="error-message">Error: {error.message}</div>
  }

  return (
    <div className="students-page">
      <div className="page-header">
        <h1>Students Management</h1>
        <button className="btn primary" onClick={handleAddStudent}>
          <Plus size={20} />
          Add Student
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Name</th>
              <th>Course</th>
              <th>Room</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Fee Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.rollNumber}</td>
                  <td>
                    <div className="student-info">
                      <strong>{student.name}</strong>
                      <small>{student.email}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{student.course}</div>
                      <small>{student.year}</small>
                    </div>
                  </td>
                  <td>{student.roomNumber}</td>
                  <td>{student.phone}</td>
                  <td>
                    <span className={`status ${student.status}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <span className={`fee-status ${student.feeStatus}`}>
                      {student.feeStatus}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon view"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-icon edit"
                        title="Edit Student"
                        onClick={() => handleEditStudent(student)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        title="Delete Student"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">
                  <div className="no-data">
                    <p>No students found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveStudent}
        />
      )}
    </div>
  )
}

const StudentModal = ({ student, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    phone: '',
    roomNumber: '',
    course: '',
    year: '',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    feeStatus: 'pending'
  })

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        joinDate: student.joinDate || new Date().toISOString().split('T')[0]
      })
    } else {
      setFormData({
        name: '',
        rollNumber: '',
        email: '',
        phone: '',
        roomNumber: '',
        course: '',
        year: '',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        feeStatus: 'pending'
      })
    }
  }, [student])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Form fields remain the same */}
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Roll Number *</label>
              <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Course *</label>
              <select name="course" value={formData.course} onChange={handleChange} required>
                <option value="">Select Course</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Year *</label>
              <select name="year" value={formData.year} onChange={handleChange} required>
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Room Number</label>
              <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fee Status</label>
              <select name="feeStatus" value={formData.feeStatus} onChange={handleChange}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="form-group">
              <label>Join Date *</label>
              <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} required />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary">{student ? 'Update' : 'Add'} Student</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Students
