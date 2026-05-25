# 🚀 Vercel Deployment Guide: Dr. Binu's Dental Clinic

This guide provides a comprehensive, step-by-step walkthrough to deploy your monorepo website to **Vercel** with peak performance and absolute reliability. 

Your workspace contains two primary projects:
1. **Frontend**: A React & Vite Single Page Application (`dental-frontend`)
2. **Backend**: An Express & MongoDB/Firebase API (`Binu's Dental Backend`)

We have already updated and committed the necessary configurations locally to make both projects fully compatible with Vercel's Serverless environment.

---

## 🛠️ Prep Work Completed

We made the following optimization changes in your codebase and committed them locally:

*   **Database Connections (`database/mongodb.js`)**: Added a readiness check (`mongoose.connection.readyState`) to reuse active connections across serverless invocations, reducing cold start times and database connection limits.
*   **Server Lifecycle (`app.js`)**: Conditionally bypassed the `app.listen(PORT)` call when running on Vercel (`process.env.VERCEL` is active) to prevent port binding hanging errors inside serverless runtime containers.
*   **Backend Serverless Mapping (`Binu's Dental Backend/vercel.json`)**: Configured Vercel's Node.js builder to bundle your Express routes and include your Firebase `serviceAccountKey.json` securely.
*   **Frontend Routing Mapping (`dental-frontend/vercel.json`)**: Added redirection rules to rewrite all incoming URLs back to `index.html` to guarantee that React Router's dynamic pages (e.g. `/appointments`, `/dashboard`) do not return a `404 Not Found` upon browser refreshes.

---

## 📋 Deployment Roadmap

Deploying a multi-directory setup on Vercel is best achieved by creating **two separate Vercel projects**. This keeps your frontend and backend completely independent, secure, and fast.

1. **Push Local Commit to GitHub**
2. **Deploy Backend in Vercel**
3. **Copy Backend URL**
4. **Deploy Frontend in Vercel** (passing Backend URL as an environment variable)
5. **Test & Verify Site Operations**

---

### Step 1: Push the Config Commit to GitHub

Since the model workspace sandbox doesn't have an active internet connection, you will need to push the config commit from your local shell. 

Run the following command in your terminal inside `/home/castlo/Documents/Dr.Binu's Dental`:
```bash
git push origin master
```

---

### Step 2: Deploy the Backend API

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** ➡️ **Project**.
2. Select your repository: `steve-antto/WondersLalls-Library`.
3. In the project setup wizard, configure the following settings:
    *   **Project Name**: `binu-dental-backend`
    *   **Framework Preset**: Select **Other**
    *   **Root Directory**: Click *Edit* and select **`Binu's Dental Backend`**
4. Expand the **Environment Variables** section and add:
    | Key | Value | Purpose |
    | :--- | :--- | :--- |
    | `NODE_ENV` | `production` | Production environment flag |
    | `DB_URI` | `mongodb+srv://binusclinic_db_user:binusclinic@cluster0.mw3wnni.mongodb.net/test?retryWrites=true&w=majority` | Your MongoDB Atlas Connection String |
    | `JWT_SECRET` | *[Your Secret Key]* | Used for patient session token signatures |
5. Click **Deploy**. Vercel will build your Express app as a Serverless API!
6. Once deployed, **copy the deployment URL** (e.g., `https://binu-dental-backend.vercel.app`).

> ⚠️ **Note**: Local uploads to `/uploads` are ephemeral in serverless environments. For persistent patient files and clinic media, your system is already preconfigured to upload files directly to **Firebase Storage**! Ensure your `serviceAccountKey.json` is active.

---

### Step 3: Deploy the Frontend App

1. Return to the Vercel Dashboard, click **Add New** ➡️ **Project**.
2. Select the same repository: `steve-antto/WondersLalls-Library`.
3. Configure the frontend settings:
    *   **Project Name**: `binu-dental`
    *   **Framework Preset**: Vercel will automatically detect **Vite**
    *   **Root Directory**: Click *Edit* and select **`dental-frontend`**
4. Expand the **Environment Variables** section and add:
    | Key | Value | Purpose |
    | :--- | :--- | :--- |
    | `VITE_API_BASE_URL` | `https://binu-dental-backend.vercel.app/api/v1` *(Replace with your Backend URL)* | Points the React app to your Vercel backend |
5. Click **Deploy**. Vercel will build and distribute your static assets globally!

---

### Step 4: Verification Checklist

Once both links are live, you can verify your deployment:
- Open your frontend link.
- Navigate to dynamic pages (like booking, contact) and refresh the page to confirm that the routes resolve perfectly.
- Open your backend URL and verify that it returns: `"Welcome to Binu's Dental Booking API"`.
- Test the database connection by submitting a contact form or checking doctor profiles.
