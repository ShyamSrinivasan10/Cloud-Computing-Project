import React, { useState, useEffect } from 'react'
import { Users, Building, MessageSquare, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react'
import { apiClient } from '../api'
import { formatDistanceToNow } from 'date-fns'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: { value: 0, change: 0 },
    totalRooms: { value: 0, change: 0 },
    occupiedRooms: { value: 0, change: 0 },
    pendingComplaints: { value: 0, change: 0 },
    totalRevenue: { value: 0, change: 0 },
    pendingFees: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // Fetch stats and activities in parallel
        const [statsData, activitiesData] = await Promise.all([
          apiClient.get('/api/dashboard-stats/'),
          apiClient.get('/api/activities/'),
        ])
        setStats(statsData)
        setRecentActivities(activitiesData)
      } catch (error) {
        console.error("Error fetching dashboard data: ", error)
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatChange = (change) => {
    if (change === 0 || change === null) return '0%'
    const sign = change > 0 ? '+' : ''
    return `${sign}${change}%`
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'student_added': return <Users size={16} />
      case 'payment_received': return <CreditCard size={16} />
      case 'complaint_filed': return <MessageSquare size={16} />
      case 'complaint_resolved': return <CheckCircle size={16} />
      case 'room_added':
      case 'room_updated': return <Building size={16} />
      default: return <TrendingUp size={16} />
    }
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.value,
      icon: Users,
      color: 'blue',
      change: formatChange(stats.totalStudents.change),
    },
    {
      title: 'Total Revenue (Month)',
      value: `₹${stats.totalRevenue.value.toLocaleString()}`,
      icon: CreditCard,
      color: 'green',
      change: formatChange(stats.totalRevenue.change),
    },
    {
      title: 'Occupied Rooms',
      value: `${stats.occupiedRooms.value} / ${stats.totalRooms.value}`,
      icon: Building,
      color: 'orange',
      change: formatChange(stats.occupiedRooms.change),
    },
    {
      title: 'Pending Complaints',
      value: stats.pendingComplaints.value,
      icon: MessageSquare,
      color: 'red',
      change: formatChange(stats.pendingComplaints.change),
    },
  ]

  if (loading) {
    return <div className="loading-message">Loading dashboard...</div>
  }

  if (error) {
    return <div className="error-message">Error: {error.message}</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to Smart Hostel Management System</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className={`stat-card ${card.color}`}>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <h3>{card.value}</h3>
                <p>{card.title}</p>
                <span className={`stat-change ${card.change.startsWith('+') ? 'positive' : card.change.startsWith('-') ? 'negative' : 'neutral'}`}>
                  {card.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="dashboard-content-full">
        <div className="dashboard-section">
          <h2>Recent Activities</h2>
          <div className="activities-list">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon ${activity.type.split('_')[0]}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <p>{activity.description}</p>
                    <span className="activity-time">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent activities.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
