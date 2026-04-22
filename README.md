# 🏨 StayVivid London — Hotel Reservation & Management System

StayVivid London is a full-stack MERN application that allows users to explore, book, and manage hotel stays across London, while providing admins with tools to manage hotels, rooms, and bookings.

---

## 🚀 Features

### 👤 User Features
- 🔐 Authentication (Signup / Login with JWT)
- 🏨 Browse hotels in London
- 🔍 Search hotels by name or location
- 🛏️ View hotel details & available rooms
- 📅 Book rooms with date selection
- 📖 View personal booking history
- ❌ Cancel bookings

---

### 🛠️ Admin Features
- 🏨 Manage hotels (Add / Edit / Delete)
- 🛏️ Manage rooms (Add / Edit / Delete)
- 📊 View all bookings
- 🔄 Update booking status (confirmed / cancelled / completed)

---

## 🏗️ Tech Stack

### Frontend
- React (with TypeScript)
- TanStack Router
- Tailwind CSS
- ShadCN UI
- Sonner (Toast notifications)

### Backend
- Node.js + Express (TypeScript)
- MongoDB + Mongoose
- JWT Authentication

---

## 📂 Project Structure
stay-finder-hub/
│
├── client/ # React Frontend
│ ├── components/
│ ├── routes/
│ └── hooks/
│
├── server/ # Node.js Backend
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ └── server.ts


---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone <your-repo-url>
cd stay-finder-hub

2️⃣ Setup Backend
cd server
npm install


3️⃣ Setup Frontend
cd client
npm install
npm run dev

🔑 Demo Admin Credentials
Email: admin@gmail.com
Password: admin@123
