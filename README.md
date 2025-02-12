# TechNotes 

TechNotes is a MERN stack web application designed for a small tech repair shop. It provides a digital CRUD solution for a note system. The app features role-based access control, JWT authentication, and a clean, responsive UI powered by Tailwind CSS.

---

##  Overview

TechNotes allows employees to manage repair notes for devices. Roles include **Employees**, **Managers**, and **Admins**, each with varying levels of access:

- **Employees** can create and update their own notes.
- **Managers and Admins** can view, assign, edit, and delete all notes.
- Only **Managers and Admins** can manage users (create, edit, activate/deactivate, delete).

### Features

- Secure login with JWT-based authentication
- Role-based access system
- CRUD functionality for notes and users
- Note assignment with ticketing system
- Responsive UI (optimized for desktop, functional on mobile)
- Redux & RTK Query for state and data fetching
- Built using Vite for fast frontend builds

---

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT)



