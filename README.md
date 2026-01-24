# DSA Progress Tracker

A full-stack web application for tracking Data Structures & Algorithms progress across multiple coding platforms (LeetCode, Codeforces, GeeksforGeeks, CodeChef, etc.).

## 🚀 Features

- **Multi-Platform Tracking**: Track problems from LeetCode, Codeforces, GFG, CodeChef, and more
- **Smart Revision System**: Spaced repetition with 1d, 7d, and 30d revision cycles  
- **Deep Analytics**: Topic-wise strength analysis, time distribution, consistency heatmaps
- **Gamification**: XP points, streak tracking, levels, and badges
- **Notes System**: Topic-wise notes, code templates, and learning resources
- **Admin Panel**: Create and manage problem sheets and problems

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Analytics charts
- **Axios** - API client

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running locally (or MongoDB Atlas URI)

### Backend Setup

1. Navigate to backend directory:
```bash
cd dsa-tracker-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dsa-tracker
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
# On Windows
net start MongoDB

# On Mac/Linux
sudo systemctl start mongod
```

5. Start the backend server:
```bash
npm run dev
```

The backend API will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd dsa-tracker-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be running at `http://localhost:3000`

## 🎯 Usage

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in at `/login`
3. **Dashboard**: View your progress overview
4. **Sheets**: Browse and solve problems from different sheets
5. **Revision**: Track and complete scheduled revisions
6. **Analytics**: View detailed progress insights
7. **Notes**: Create and organize topic-wise notes

## 👤 Creating an Admin User

To create sheets and problems, you need an admin account. You can manually update a user's role in MongoDB:

```javascript
// Connect to MongoDB
use dsa-tracker

// Update user role to admin
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Problems
- `GET /api/problems` - Get all problems (with filters)
- `POST /api/problems` - Create problem (admin)
- `PUT /api/problems/:id` - Update problem (admin)
- `DELETE /api/problems/:id` - Delete problem (admin)

### Sheets
- `GET /api/sheets` - Get all sheets
- `GET /api/sheets/:id` - Get sheet with problems
- `POST /api/sheets` - Create sheet (admin)
- `PUT /api/sheets/:id` - Update sheet (admin)

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress/solve` - Mark problem as solved
- `GET /api/progress/stats` - Get statistics

### Revision
- `GET /api/revision` - Get revision schedule
- `GET /api/revision/overdue` - Get overdue revisions
- `PUT /api/revision/:id/complete` - Mark revision complete

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Analytics
- `GET /api/analytics/topic-strength` - Topic-wise analysis
- `GET /api/analytics/time-distribution` - Time analysis
- `GET /api/analytics/consistency` - Consistency data
- `GET /api/analytics/platform-stats` - Platform distribution

## 🔧 Development

### Backend Development
```bash
cd dsa-tracker-backend
npm run dev  # Runs with nodemon (auto-restart)
```

### Frontend Development
```bash
cd dsa-tracker-frontend
npm run dev  # Runs Next.js dev server
```

## 🚀 Deployment

### Backend (Render/Railway)
1. Create a new web service
2. Connect your GitHub repository
3. Set environment variables (PORT, MONGODB_URI, JWT_SECRET)
4. Deploy

### Frontend (Vercel)
1. Import your GitHub repository
2. Framework preset: Next.js
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Database (MongoDB Atlas)
1. Create a free cluster
2. Get connection string
3. Update `MONGODB_URI` in backend environment variables

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
