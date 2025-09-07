# Smart Hostel Management System

A comprehensive web application for managing college hostel operations built with React.js frontend and designed to work with Django backend and MySQL database.

## Features

### 🏠 Dashboard
- Real-time statistics and metrics
- Recent activities tracking
- System alerts and notifications
- Quick action buttons

### 👥 Student Management
- Add, edit, and delete student records
- Search and filter functionality
- Room assignment tracking
- Fee status monitoring

### 🏢 Room Management
- Room availability tracking
- Occupancy management
- Maintenance scheduling
- Amenities tracking

### 📝 Complaints Management
- Submit and track complaints
- Priority-based categorization
- Status updates (Pending → In Progress → Resolved)
- Assignment to maintenance teams

### 💰 Fee Management
- Fee collection tracking
- Payment recording
- Late fee calculations
- Receipt generation
- Export reports

## Tech Stack

### Frontend
- **React.js** (with JSX, no TypeScript)
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons
- **Vite** for development server

### Backend (Ready for Integration)
- **Django** REST Framework
- **MySQL** database
- JWT authentication
- RESTful API endpoints

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hostel-management-system
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Login
- **Username:** admin
- **Password:** admin123

## API Integration

The frontend is designed to work with a Django backend. The API service is located in `src/services/api.js` and includes methods for:

- Authentication (login/logout)
- Student CRUD operations
- Room management
- Complaint handling
- Fee management
- Dashboard statistics

### Expected API Endpoints

```
POST /api/auth/login/
POST /api/auth/logout/
GET /api/students/
POST /api/students/
GET /api/students/{id}/
PUT /api/students/{id}/
DELETE /api/students/{id}/
GET /api/rooms/
POST /api/rooms/
GET /api/complaints/
POST /api/complaints/
PATCH /api/complaints/{id}/status/
GET /api/fees/
POST /api/fees/{id}/payment/
GET /api/dashboard/stats/
```

## Database Schema (MySQL)

### Students Table
```sql
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    course VARCHAR(50) NOT NULL,
    year VARCHAR(10) NOT NULL,
    room_number VARCHAR(10),
    status ENUM('active', 'inactive') DEFAULT 'active',
    join_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Rooms Table
```sql
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    floor INT NOT NULL,
    capacity INT NOT NULL,
    occupied INT DEFAULT 0,
    type VARCHAR(20) NOT NULL,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    rent DECIMAL(10,2) NOT NULL,
    amenities JSON,
    last_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Complaints Table
```sql
CREATE TABLE complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    student_id INT,
    room_number VARCHAR(10),
    category VARCHAR(50) NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'in-progress', 'resolved') DEFAULT 'pending',
    assigned_to VARCHAR(100),
    date_submitted DATE NOT NULL,
    date_resolved DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

### Fee Records Table
```sql
CREATE TABLE fee_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    month VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    late_fee DECIMAL(10,2) DEFAULT 0,
    due_date DATE NOT NULL,
    paid_date DATE,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    payment_method VARCHAR(20),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

## Features Overview

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface

### User Experience
- Intuitive navigation
- Real-time updates
- Loading states
- Error handling
- Success notifications

### Security Ready
- JWT token authentication
- Protected routes
- Input validation
- XSS protection

## Development

### Project Structure
```
src/
├── components/          # Reusable components
│   └── Navbar.jsx
├── pages/              # Page components
│   ├── Dashboard.jsx
│   ├── Students.jsx
│   ├── Rooms.jsx
│   ├── Complaints.jsx
│   ├── Fees.jsx
│   └── Login.jsx
├── services/           # API services
│   └── api.js
├── App.jsx            # Main app component
├── App.css           # Styles
├── index.css         # Global styles
└── main.jsx          # Entry point
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.