# 🦷 Dr. Binu's Dental Clinic — Comprehensive Portal

Welcome to the complete repository for **Dr. Binu's Dental Clinic Portal**. This project consists of a cinematic, highly interactive React-based frontend powered by **Three.js** and **Tailwind CSS**, paired with a robust **Node.js/Express/MongoDB** backend utilizing **Firebase Admin** for secure authentication and user management.

---

## 🌟 Key Features

### 💻 Frontend (`dental-frontend`)
*   **Cinematic 3D Visualizer**: Interactive 3D jaw and dental model visualization powered by `@react-three/fiber` and `@react-three/drei` allowing patients to explore anatomy and understand procedures.
*   **Multilingual Support (i18n)**: Fully localized in 5 languages: **English**, **Tamil (தமிழ்)**, **Malayalam (മലയാളം)**, **Hindi (हिन्दी)**, and **Telugu (తెలుగు)**.
*   **Real Google Reviews Integration**: Real reviews synced from Google listings featuring Local Guide badges, rating stars, and formatted detailed feedback.
*   **Dr. Slider Profiles**: Seamless interactive slider profiles for clinic doctors (Dr. Binu and Dr. Lokaswari) featuring high-quality profiles.
*   **Advanced Booking Engine**: Appointment scheduler that dynamically restricts past slots, blocks Sundays, and collects necessary validation details (e.g., 10-digit Indian mobile numbers).
*   **Patient Portal**: Personalized dashboard containing appointment history, digital prescriptions, scans, medical history reports, and real-time clinic status.

### ⚙️ Backend (`Binu's Dental Backend`)
*   **Scalable Express Architecture**: Structured MVC routes for appointments, doctors, authentication, and patient medical files.
*   **MongoDB & Mongoose**: Fully structured schemas mapping appointments, logs, and medical histories.
*   **Secure Auth**: Firebase Authentication integrated with server-side custom JWT verification.
*   **File Upload Support**: `multer` middleware ready for uploading scans, digital receipts, and medical reports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, Lucide Icons |
| **3D Renderers** | Three.js, React Three Fiber (R3F), Drei |
| **Localization** | i18next, react-i18next |
| **Authentication** | Firebase Client SDK (Google & Email Auth) |
| **Backend Core** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Storage & Security** | Firebase Admin SDK, JSON Web Tokens (JWT), Multer |

---

## 📂 Directory Structure

```text
Dr. Binu's Dental/
├── dental-frontend/                # React Vite Frontend Application
│   ├── src/
│   │   ├── assets/                 # Profile images, custom SVGs, and hero banners
│   │   ├── components/             # Reusable UI elements (Navbar, 3D jaw viewer, etc.)
│   │   ├── pages/                  # About, Services, Booking, Reviews, and Patient Portal
│   │   ├── i18n/                   # Translation configurations and locale resources
│   │   └── main.tsx
│   └── package.json
│
└── Binu's Dental Backend/          # Node.js REST API Backend Server
    ├── config/                     # DB & Firebase configuration
    ├── controllers/                # Request handling logic
    ├── models/                     # Mongoose schemas
    ├── routes/                     # API route declarations
    ├── app.js                      # Server initialization file
    └── package.json
```

---

## 🚀 Getting Started

### 📋 Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Local instance or Atlas cloud cluster)
*   [Firebase Project](https://console.firebase.google.com/) configured with Email & Google sign-in methods

---

### 1️⃣ Setting up the Backend

1.  Navigate to the backend directory:
    ```bash
    cd "Binu's Dental Backend"
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root of the backend folder and define the following:
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/binu_dental
    JWT_SECRET=your_jwt_signing_secret_here
    FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
    ```
4.  Place your exported Firebase Admin service account key inside the `config/` folder matching the path above.
5.  Start the backend server in development mode:
    ```bash
    npm run dev
    ```

---

### 2️⃣ Setting up the Frontend

1.  Navigate to the frontend directory:
    ```bash
    cd ../dental-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root of the frontend folder:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

The frontend will run locally on [http://localhost:5173/](http://localhost:5173/) and automatically hot-reload upon changes.

---

## 🧪 Development Commands Summary

| Command | Location | Description |
| :--- | :--- | :--- |
| `npm run dev` | `dental-frontend` | Starts the Vite server for React |
| `npm run build` | `dental-frontend` | Compiles TypeScript and creates optimized build |
| `npm run dev` | `Binu's Dental Backend` | Starts the Express API with `nodemon` |
| `npm start` | `Binu's Dental Backend` | Runs node server in production mode |

---

## 🔒 Security Practices
*   **API Authentication**: All medical and dashboard-related routes require custom headers validating Firebase JWT tokens.
*   **Input Validation**: Dynamic client-side and server-side validators ensure strict format compliance on phone numbers, dates, and times.
*   **Sterilization & Medical Safety**: System models strictly track sterilization cycles matching clinic autoclave protocols.
