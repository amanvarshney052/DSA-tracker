# DSA Tracker 🚀

A powerful, full-stack application designed to help you master Data Structures & Algorithms by tracking your progress, consistency, and growth using gamification and detailed analytics.

## 🌟 Key Features

### 📊 **Smart Dashboard**
- **Overview**: View total problems solved, current streak, and detailed consistency graphs.
- **Gamified Progress**: Earn **XP** and **Levels** as you solve problems.
- **Activity Heatmap**: GitHub-style contribution graph to visualize your daily activity.
- **Share Progress**: Generate beautiful, shareable image cards of your stats for social media (LinkedIn/Twitter).

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
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Image Generation**: html2canvas

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Authentication**: JWT & BCrypt

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URL)

### 1. Clone the Repository
```bash
git clone https://github.com/amanvarshney052/DSA-tracker.git
cd DSA-tracker
```

### 2. Backend Setup
```bash
cd dsa-tracker-backend
npm install

# Create a .env file
# PORT=5000
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

npm run dev
```

### 3. Frontend Setup
```bash
cd dsa-tracker-frontend
npm install

# Create a .env.local file
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm run dev
```

Access the app at `http://localhost:3000`!

---

## 👤 Author

**Aman Varshney**
- [GitHub](https://github.com/amanvarshney052)
