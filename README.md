 <div align="center">

# ◈ Olyvex

**A full-stack user management application with secure authentication, profile management, and an admin dashboard — powered by React, TypeScript, Redux Toolkit, Express, and MongoDB.**

<br/>

<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />

<br/><br/>

[![Live Demo](https://img.shields.io/badge/🌐_LIVE_DEMO-2563EB?style=for-the-badge)](https://mizu-olyvex.vercel.app/)

</div>

## Preview

<p align="center">
  <img src="./screenshots/home.png" width="49%" alt="Olyvex Home Page" />
  <img src="./screenshots/profile.png" width="49%" alt="Olyvex Profile Page" />
</p>

<p align="center">
  <img src="./screenshots/register.png" width="49%" alt="User Registration" />
  <img src="./screenshots/admin-login.png" width="49%" alt="Admin Login" />
</p>

<p align="center">
  <img src="./screenshots/admin-users.png" width="100%" alt="Olyvex Admin Dashboard" />
</p>

<br/>

## ✨ Highlights

- 🔐 **Authentication & Authorization** — JWT-based authentication with access and refresh tokens.
- 👤 **User Profiles** — View and update profile information, including profile images.
- 🛡️ **Protected Routes** — Separate route protection for authenticated users and administrators.
- 👨‍💻 **Admin Dashboard** — Manage users with create, update, and delete operations.
- 🔎 **Search & Pagination** — Search users with server-side pagination.
- ✅ **Form Validation** — Type-safe validation using React Hook Form and Zod.
- 🔄 **Session Restoration** — Restore authentication sessions after page reloads.
- 📱 **Responsive UI** — A modern interface with interactive animations.

<br/>

## 🛠️ Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Redux Toolkit — State management
- React Router — Client-side routing
- Axios — API requests
- React Hook Form & Zod — Form handling and validation

**Backend**
- Node.js
- Express
- TypeScript
- Zod — Request validation
- JWT — Authentication

**Database**
- MongoDB
- Mongoose — Object data modeling

**Additional Tools**
- Cloudinary — Profile image management

<br/>

## 🔒 Authentication

Olyvex uses access and refresh tokens to manage authenticated sessions.

- Access tokens are maintained in Redux state and used for authenticated API requests.
- Refresh tokens are handled through HTTP-only cookies.
- Protected routes restrict access to pages that require authentication or administrator privileges.
- Session restoration allows valid sessions to continue after a page reload.

<br/>

<div align="center">

**Built with ❤️ using React, TypeScript, Node.js, Express, and MongoDB**

</div>
