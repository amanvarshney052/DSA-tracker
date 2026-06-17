# DSA Tracker 🚀

A powerful, full-stack application designed to help you master Data Structures & Algorithms by tracking your progress, consistency, and growth using gamification and detailed analytics.

![Dashboard Preview](./dsa-tracker-frontend/public/icons/icon-192x192.png) <!-- Replace with a real screenshot when available -->

## 🌟 Key Features

### 📊 **Smart Dashboard**
- **Overview**: View total problems solved, current streak, and detailed consistency graphs.
- **Gamified Progress**: Earn **XP** and **Levels** as you solve problems.
- **Activity Heatmap**: GitHub-style contribution graph to visualize your daily activity.
- **Share Progress**: Generate beautiful, shareable image cards of your stats for social media (LinkedIn/Twitter).
- **Lightning Fast**: Parallel data fetching and skeleton UI loading states ensure a smooth user experience.

### 📝 **Sheet Management**
- **Multiple Sheets**: Support for various DSA sheets (e.g., Striver's SDE Sheet, Love Babbar 450).
- **Topic Filtering**: Filter problems by specific topics (Arrays, DP, Graphs, etc.).
- **Smart Recommendations**: Get suggestions on what to solve next based on your weak areas.

### 🛡️ **Admin Panel**
- **User Management**: View and manage registered users.
- **Content Control**: Add, edit, or delete Sheets and Problems directly from the UI.
- **Daily Challenge**: Schedule daily "Problem of the Day" challenges for all users.

### 📈 **Analytics & Insights**
- **Topic Strength**: Radar charts showing your proficiency in different topics.
- **Consistency**: Line graphs tracking your problem-solving frequency.
- **Time Tracking**: Insights into how much time you invest in learning.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Image Generation**: html2canvas

### **Backend**
- **Language**: Java 25
- **Framework**: [Spring Boot 3](https://spring.io/projects/spring-boot)
- **Security**: Spring Security & JSON Web Token (JWT)
- **Database**: MongoDB (Spring Data MongoDB)
- **Email Service**: Spring Boot Mail (SMTP)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- Java JDK 25
- Maven (or use the provided wrapper)
- MongoDB (Local or Atlas URL)

### 1. Clone the Repository
```bash
git clone https://github.com/amanvarshney052/DSA-tracker.git
cd DSA-tracker
```

### 2. Configuration Setup

**Backend Config (`dsa-tracker-backend/src/main/resources/application.properties`):**
Update the following environment variables or properties:
```properties
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_at_least_256_bits
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Frontend Config (`dsa-tracker-frontend/.env.local`):**
Create the file and add:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Install & Run

The project has a unified command to install dependencies and run both the frontend and backend simultaneously!

```bash
# From the root directory:
npm install        # Installs root concurrently tools
npm run install-all # Installs frontend dependencies

# Run both frontend and backend concurrently:
npm run dev
```

The app will be accessible at:
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:5000`

---

## 🏗️ Build for Production

To create production builds:
```bash
npm run build-backend   # Compiles Spring Boot .jar to backend/target/
npm run build-frontend  # Creates Next.js production build in frontend/.next/
```

---

## 👤 Author

**Aman Varshney**
- [GitHub](https://github.com/amanvarshney052)
