# 🚗 VehicleBook - Vehicle Booking Management System

Aplikasi pemesanan kendaraan berbasis web untuk perusahaan tambang nikel.
Mendukung monitoring kendaraan, pemesanan, dan persetujuan berjenjang.

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React JS 18 + Vite |
| Backend | Express JS (Node.js) |
| Database | MySQL |
| ORM | Sequelize |
| Auth | JWT (JSON Web Token) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Export | ExcelJS |

---

## ⚙️ Requirements

| Tool | Version |
|------|---------|
| Node.js | v18+ |
| npm | v9+ |
| MySQL | v8.0+ |

---

## 🗄️ Database Setup

1. Pastikan MySQL sudah berjalan
2. Buat database baru:

```sql
CREATE DATABASE vehicle_booking;
```

3. Sequelize akan otomatis membuat tabel saat server pertama kali dijalankan

---

## 🚀 Cara Menjalankan

### Backend

```bash
cd backend
npm install
```

Buat file `.env` di folder `backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vehicle_booking
JWT_SECRET=your_jwt_secret_key
```

Jalankan server:

```bash
npm run dev
```

Server berjalan di: `http://localhost:5000`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikasi berjalan di: `http://localhost:5173`

---

## 👤 Default Users

Buat user melalui endpoint register atau langsung via Postman:

```
POST http://localhost:5000/api/auth/register
```

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vehicle.com | admin123 |
| Approver 1 | approver1@vehicle.com | approver123 |
| Approver 2 | approver2@vehicle.com | approver123 |

---

## 📁 Struktur Project

```
vehicle-booking/
├── backend/
│   ├── config/
│   │   └── database.js         # Konfigurasi Sequelize
│   ├── controllers/
│   │   ├── authController.js   # Login, register, get users
│   │   ├── bookingController.js # CRUD pemesanan
│   │   ├── approvalController.js # Proses persetujuan
│   │   ├── vehicleController.js # CRUD kendaraan
│   │   ├── driverController.js  # CRUD driver
│   │   ├── dashboardController.js # Statistik dashboard
│   │   └── reportController.js  # Export Excel
│   ├── middlewares/
│   │   ├── auth.js             # JWT authentication
│   │   └── logger.js           # Activity logger
│   ├── models/
│   │   ├── index.js            # Relasi antar model
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Driver.js
│   │   ├── Booking.js
│   │   └── Approval.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── approvalRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── reportRoutes.js
│   │   └── logRoutes.js
│   ├── logs/                   # File log harian (auto-generated)
│   ├── .env
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance + interceptors
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── Topbar.jsx
    │   │   │   └── Layout.jsx
    │   │   └── ui/
    │   │       ├── StatCard.jsx
    │   │       ├── StatusBadge.jsx
    │   │       ├── LoadingSkeleton.jsx
    │   │       └── Modal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Bookings.jsx
    │   │   ├── Approvals.jsx
    │   │   ├── Vehicles.jsx
    │   │   ├── Drivers.jsx
    │   │   ├── Reports.jsx
    │   │   └── ActivityLog.jsx
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   └── main.jsx
    └── index.html
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | ❌ |
| POST | /api/auth/login | Login | ❌ |
| GET | /api/auth/me | Get current user | ✅ |
| GET | /api/auth/users | Get all users | ✅ Admin |

### Vehicles
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/vehicles | Get all vehicles | ✅ |
| GET | /api/vehicles/:id | Get vehicle by id | ✅ |
| POST | /api/vehicles | Create vehicle | ✅ Admin |
| PUT | /api/vehicles/:id | Update vehicle | ✅ Admin |
| DELETE | /api/vehicles/:id | Delete vehicle | ✅ Admin |

### Drivers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/drivers | Get all drivers | ✅ |
| GET | /api/drivers/:id | Get driver by id | ✅ |
| POST | /api/drivers | Create driver | ✅ Admin |
| PUT | /api/drivers/:id | Update driver | ✅ Admin |
| DELETE | /api/drivers/:id | Delete driver | ✅ Admin |

### Bookings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/bookings | Get all bookings | ✅ Admin |
| GET | /api/bookings/my | Get my bookings | ✅ |
| GET | /api/bookings/:id | Get booking by id | ✅ |
| POST | /api/bookings | Create booking | ✅ Admin |
| PATCH | /api/bookings/:id/complete | Complete booking | ✅ Admin |

### Approvals
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/approvals/my | Get my approvals | ✅ |
| PATCH | /api/approvals/:id | Process approval | ✅ |

### Dashboard & Reports
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/dashboard | Get dashboard stats | ✅ Admin |
| GET | /api/reports/export | Export Excel | ✅ Admin |
| GET | /api/logs | Get activity logs | ✅ Admin |

---

## ✨ Fitur Aplikasi

### Admin
- ✅ Login & autentikasi JWT
- ✅ Dashboard dengan grafik pemakaian kendaraan
- ✅ Buat pemesanan kendaraan
- ✅ Pilih driver & kendaraan yang tersedia
- ✅ Setup persetujuan berjenjang (minimal 2 level)
- ✅ Manajemen kendaraan (CRUD + status)
- ✅ Manajemen driver (CRUD)
- ✅ Laporan periodik + export Excel
- ✅ Activity log harian

### Approver
- ✅ Login & autentikasi JWT
- ✅ Melihat daftar persetujuan
- ✅ Approve / reject pemesanan
- ✅ Tambah catatan persetujuan
- ✅ Notifikasi jumlah pending approval

### Sistem
- ✅ Persetujuan berjenjang (level 1 → level 2)
- ✅ Auto update status kendaraan & driver
- ✅ Activity log setiap request
- ✅ JWT authentication & role-based access

---

## 📊 Physical Data Model

```
Users
├── id (PK)
├── name
├── email (unique)
├── password
├── role (admin | approver)
└── timestamps

Vehicles
├── id (PK)
├── name
├── plate_number (unique)
├── type (passenger | cargo)
├── ownership (own | rent)
├── status (available | in_use | maintenance)
└── timestamps

Drivers
├── id (PK)
├── name
├── license_number (unique)
├── phone
├── status (available | on_duty)
└── timestamps

Bookings
├── id (PK)
├── user_id (FK → Users)
├── vehicle_id (FK → Vehicles)
├── driver_id (FK → Drivers)
├── purpose
├── start_date
├── end_date
├── destination
├── status (pending | approved | rejected | completed)
└── timestamps

Approvals
├── id (PK)
├── booking_id (FK → Bookings)
├── approver_id (FK → Users)
├── level
├── status (waiting | pending | approved | rejected | cancelled)
├── notes
└── timestamps
```

---

## 📝 Catatan Pengembangan

- Semua API menggunakan format response `{ message, data }`
- JWT token expire dalam **1 hari**
- Log aktivitas disimpan di folder `backend/logs/` per hari
- Export Excel menggunakan library **ExcelJS**
- Database sync otomatis menggunakan `sequelize.sync()`

---

*Dibuat untuk Technical Test - Fullstack Developer Intern*
