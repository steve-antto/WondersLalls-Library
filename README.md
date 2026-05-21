# 🪻 WondersLalls College Library Portal

An elite, high-end, next-generation digital library management workspace styled in a premium **Dark Glassmorphic** theme accented by elegant **Lavender Blue** highlights. Built with a robust **React & TypeScript** frontend and a performant **Node.js, Express, & MongoDB** backend.

---

## ✨ Features

### 🎛️ Dual-Dashboard Environments
* **Student Dashboard**: A personalized cosmic hub displaying currently borrowed books, due dates, notification inboxes, active schedules, and a dynamic time-based greeting (*"Good evening, Steve!"*).
* **Administration & Librarian Desk**: An operational center equipped with student directory auditing, book asset creation, circulation tracking, and checkout desks.

### 📚 Digital Catalog & Intelligent Inventory
* **Sample Books from the Net**: Pre-seeded with popular titles complete with real, high-resolution covers fetched automatically via the Open Library API.
* **Canvas Fallback Covers**: Dynamic geometric editorial covers generated programmatically on-canvas if custom cover assets are absent.
* **Student Direct Borrowing**: An actionable catalog allowing active students to request and borrow available books for 14-day intervals in one click.

### 🔔 Real-Time Messaging & Automation
* **Overdue Reminder Jobs**: Automated background cron-jobs that scan active loans, calculate outstanding late fines (₹ rate per day), and dispatch email notifications to students.
* **Notification Logging**: Custom system logs, checkout receipts, and settlement notifications stored dynamically per student.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, **TailwindCSS v4**, Lucide React, React Hot Toast |
| **Backend** | Node.js, Express, MongoDB, Mongoose, Winston Logger, Multer (multipart uploads) |
| **Services** | Nodemailer (SMTP dispatch), Node-Cron (scheduled background routines) |

---

## 🚀 Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas cluster)

### 1. Clone & Core Setup
```bash
# Enter project directory
cd "/home/castlo/Documents/Library Management"
```

### 2. Backend Configuration
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   npm install
   ```
2. Configure your environment. Open or create `.env.development.local` and add:
   ```env
   PORT=3000
   MONGO_URI="mongodb+srv://<username>:<password>@cluster0...mongodb.net/library"
   JWT_SECRET="your-ultra-secure-jwt-key"
   FINE_RATE_PER_DAY=10
   
   # Optional SMTP details for emails
   SMTP_HOST="smtp.mailtrap.io"
   SMTP_PORT=2525
   SMTP_USER="your-smtp-username"
   SMTP_PASS="your-smtp-password"
   FROM_EMAIL="library@wonderslalls.edu"
   ```
3. Boot the backend server (starts the server and seeds defaults):
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration
1. Navigate to the `Frontend` directory:
   ```bash
   cd ../Frontend
   npm install
   ```
2. Boot the frontend development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

---

## 🔐 Credentials (Default Seeded Admin)
The database automatically seeds an administrator profile on its very first successful connection:
* **Email**: `admin@library.com`
* **Password**: `AdminPass123!`

---

## 🎨 Global Design Tokens
The application implements custom CSS tokens in `index.css` leveraging TailwindCSS v4:
* **Background**: `#06050e` transparent glass overlay allowing the cosmic starry background to float through.
* **Primary Accent Color**: `#7b92ff` (Lavender Blue) with hover configurations mapped to `#6079f8`.
* **Surface**: `rgba(15, 23, 42, 0.4)` (Translucent blur panels).
