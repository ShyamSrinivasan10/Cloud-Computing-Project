import React, { useState, useEffect } from 'react'
import { Search, Plus, Eye, Download, Filter, CreditCard, AlertCircle } from 'lucide-react'
import { apiClient } from '../api'

const Fees = () => {
  const [feeRecords, setFeeRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFeeRecords = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get('/api/fee-records/')
      setFeeRecords(data)
      setFilteredRecords(data)
    } catch (error) {
      console.error("Error fetching fee records: ", error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeeRecords()
  }, [])

  useEffect(() => {
    let filtered = feeRecords
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus)
    }
    if (filterMonth !== 'all') {
      filtered = filtered.filter(record => record.month === filterMonth)
    }
    setFilteredRecords(filtered)
  }, [feeRecords, searchTerm, filterStatus, filterMonth])

  const handlePayment = (record) => {
    setSelectedRecord(record)
    setShowPaymentModal(true)
  }

  const handleGenerateBills = async () => {
    if (window.confirm('Are you sure you want to generate bills for the current month? This may create duplicate entries if run multiple times.')) {
      try {
        const data = await apiClient.post('/api/generate-bills/', { body: {} })
        alert(data.message)
        fetchFeeRecords() // Refresh the list
      } catch (error) {
        console.error("Error generating bills: ", error)
        alert(`Failed to generate bills: ${error.message}`)
      }
    }
  }

  const processPayment = async (paymentData) => {
    try {
      const updatedRecord = {
        ...selectedRecord,
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: paymentData.method,
        transactionId: paymentData.transactionId,
        notes: paymentData.notes
      }

      const savedRecord = await apiClient.put(`/api/fee-records/${selectedRecord.id}/`, { body: updatedRecord })

      setFeeRecords(feeRecords.map(record =>
        record.id === savedRecord.id ? savedRecord : record
      ))
      setShowPaymentModal(false)
      setSelectedRecord(null)
    } catch (error) {
      console.error("Error processing payment: ", error)
      alert(`Failed to record payment: ${error.message}`)
    }
  }

  const getTotalStats = () => {
    const total = feeRecords.reduce((sum, record) => sum + parseFloat(record.amount) + parseFloat(record.lateFee || 0), 0)
    const collected = feeRecords
      .filter(record => record.status === 'paid')
      .reduce((sum, record) => sum + parseFloat(record.amount) + parseFloat(record.lateFee || 0), 0)
    const pending = total - collected
    return { total, collected, pending }
  }

  const stats = getTotalStats()

  if (loading) {
    return <div className="loading-message">Loading fee records...</div>
  }

  if (error) {
    return <div className="error-message">Error: {error.message}</div>
  }

  return (
    <div className="fees-page">
      <div className="page-header">
        <h1>Fee Management</h1>
        <div className="header-actions">
          <button className="btn secondary">
            <Download size={20} />
            Export Report
          </button>
          <button className="btn primary" onClick={handleGenerateBills}>
            <Plus size={20} />
            Generate Bills
          </button>
        </div>
      </div>

      <div className="fee-stats">
        {/* ... stats cards ... */}
      </div>

      <div className="filters-section">
        {/* ... filters ... */}
      </div>

      <div className="fees-table">
        <table>
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Room</th>
              <th>Month</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Payment Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td>
                  <div className="student-info">
                    <strong>{record.studentName}</strong>
                    <small>{record.rollNumber}</small>
                  </div>
                </td>
                <td>{record.roomNumber}</td>
                <td>{record.month}</td>
                <td>
                  <div className="amount-info">
                    <div>₹{parseFloat(record.amount).toLocaleString()}</div>
                    {record.lateFee > 0 && (
                      <small className="late-fee">+₹{parseFloat(record.lateFee).toLocaleString()} (Late Fee)</small>
                    )}
                  </div>
                </td>
                <td>
                  <div className={`due-date ${new Date(record.dueDate) < new Date() && record.status !== 'paid' ? 'overdue' : ''}`}>
                    {new Date(record.dueDate).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={`status ${record.status}`}>{record.status}</span>
                </td>
                <td>
                  {record.status === 'paid' ? (
                    <div className="payment-info">
                      <div>{record.paymentMethod}</div>
                      <small>{record.transactionId}</small>
                      <small>{new Date(record.paidDate).toLocaleDateString()}</small>
                    </div>
                  ) : (
                    <span className="no-payment">-</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon view" title="View Receipt"><Eye size={16} /></button>
                    {record.status !== 'paid' && (
                      <button className="btn small primary" onClick={() => handlePayment(record)}>Record Payment</button>
                    )}
                    {record.status === 'paid' && (
                      <button className="btn small secondary"><Download size={16} />Receipt</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPaymentModal && selectedRecord && (
        <PaymentModal
          record={selectedRecord}
          onClose={() => { setShowPaymentModal(false); setSelectedRecord(null); }}
          onSave={processPayment}
        />
      )}
    </div>
  )
}

const PaymentModal = ({ record, onClose, onSave }) => {
  const [paymentData, setPaymentData] = useState({
    method: 'online',
    transactionId: '',
    notes: ''
  })

  useEffect(() => {
    if (record) {
      setPaymentData({
        method: record.paymentMethod || 'online',
        transactionId: record.transactionId || '',
        notes: record.notes || ''
      })
    }
  }, [record])

  const handleSubmit = (e) => {
    e.preventDefault()
    const transactionId = paymentData.method === 'cash' 
      ? `CASH${Date.now()}` 
      : paymentData.transactionId
    
    onSave({ ...paymentData, transactionId })
  }

  const handleChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value })
  }

  const totalAmount = parseFloat(record.amount) + parseFloat(record.lateFee || 0)

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Record Payment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="payment-summary">
          {/* ... summary ... */}
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {/* ... form ... */}
        </form>
      </div>
    </div>
  )
}

export default Fees
