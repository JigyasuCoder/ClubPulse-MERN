# 🚀 ClubPulse MERN

A modern, full-stack event management and feedback collection platform built with the MERN stack (MongoDB, Express, React, Node.js). **ClubPulse** enables organizers to create events with custom evaluation criteria, collect structured feedback from attendees, and gain immediate insights through analytics.

---

## ✨ Features

- **🔐 Admin Authentication:** Secure JWT-based admin login for event creators and managers.
- **📅 Dynamic Event Management:** Create, view, and delete club events with custom event passcodes and types.
- **📝 Custom Evaluation Criteria:** Define specific rating fields and dynamic criteria tailored for each unique event.
- **🔒 Passcode-Protected Feedback Portal:** Attendees enter an event-specific passcode to unlock and submit ratings and written feedback.
- **📊 Real-Time Analytics & Visualizations:** Visual breakdown of evaluation criteria and feedback response metrics.
- **🤖 Pulse AI Assistant:** Integrated AI chatbot powered by Google Gemini to analyze participant feedback and summarize event sentiment.
- **📋 One-Click Shareable Links:** Easily copy production feedback links directly from the admin dashboard.

---

## 📖 User Guide

### **1. Admin Access**
1. Navigate to `/admin/login`.
2. Sign in using your registered admin credentials (`admin@codeio.com` / `admin123`).
3. Upon successful authentication, you will be redirected to the **Admin Dashboard**.

### **2. Creating an Event**
1. On the **Admin Dashboard**, click the **`+ Create Event`** button.
2. Fill in the event details:
   - **Event Title:** Name of your event or workshop.
   - **Type:** Category (e.g., *Tech / Workshop*, *Gaming / Cultural*, *Hackathon*).
   - **Passcode:** A 4-digit code required by attendees to open the feedback form.
   - **Description:** A short summary of the event goals.
3. Define **Evaluation Criteria** (e.g., *Speaker Clarity*, *Hands-on Utility*). You can add or remove fields dynamically.
4. Click **`Save & Publish Event`**.

### **3. Sharing the Feedback Link**
1. Locate your event card on the dashboard.
2. Click **`Copy Link`** to copy the public feedback URL to your clipboard.
3. Share the copied link along with the **Event Passcode** with attendees.

### **4. Submitting Feedback (Attendee View)**
1. Attendees open the shared link (`/feedback/:eventId`).
2. Enter the **Event Passcode** provided by the organizer to unlock the form.
3. Rate each evaluation criterion on a **1–5 scale** and add optional written comments.
4. Click **`Submit Feedback`**.

### **5. Viewing Analytics & AI Insights**
1. Click on any event card on the dashboard to open its detailed view.
2. Review the **Criteria Ratings Chart** and incoming written feedback submissions in real time.
3. Open the **Pulse AI Assistant** (bottom-right widget) and ask questions like *"Summarize attendee sentiment"* or *"What can we improve for next time?"* to generate instant AI insights from submitted feedback.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React.js (built with Vite)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Charts:** Chart.js & React-Chartjs-2
- **Deployment:** Vercel

### **Backend**
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB Atlas (via Mongoose)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **AI Engine:** Google Gemini API
- **Deployment:** Render

---

## 📁 Repository Structure

```text
ClubPulse-MERN/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── models/          # Mongoose schemas (User, Event, Feedback)
│   ├── routes/          # Express API endpoints
│   ├── seed.js          # Admin account seeder script
│   ├── server.js        # Server entry point
│   └── .env             # Environment variables (git-ignored)
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # AdminDashboard, AdminLogin, FeedbackForm
    │   ├── api.js       # Axios base instance
    │   ├── App.jsx      # React router & global layouts
    │   └── main.jsx     # Entry point
    ├── index.html
    └── package.json
