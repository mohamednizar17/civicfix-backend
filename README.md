# CivicFix Backend

This is the Node.js/Express backend API for [CivicFix](https://civicfix-frontend-pearl.vercel.app/), a platform for civic complaint management and resolution.

## 🚀 Live API

[https://civicfix-backend-w43z.onrender.com/](https://civicfix-backend-w43z.onrender.com/)

## ✨ Features

- RESTful API for complaints, users, and admin tools
- JWT authentication
- MongoDB Atlas database
- Email notifications (Nodemailer)
- Admin-only status updates and comments
- Complaint status timeline/history
- CORS configured for frontend security

## 🛠️ Tech Stack

- Node.js
- Express
- MongoDB (Mongoose)
- Nodemailer
- Render (hosting)

## 🔗 Frontend

The frontend is live at:  
[https://civicfix-frontend-pearl.vercel.app/](https://civicfix-frontend-pearl.vercel.app/)

## 📦 Getting Started (Local Development)

```bash
git clone https://github.com/yourusername/civicfix-backend.git
cd civicfix-backend
npm install
npm run dev
```

- Create a `.env` file with your secrets:
  ```
  MONGO_URI=your_mongodb_atlas_uri
  JWT_SECRET=your_jwt_secret
  EMAIL_USER=your_email
  EMAIL_PASS=your_email_password
  ```

## 📄 License

ISC
