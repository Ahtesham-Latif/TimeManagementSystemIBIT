# Timetable Management System (TMS) - IBIT

A comprehensive Timetable Management System developed for the Institute of Business & Information Technology (IBIT), University of the Punjab.

## 🚀 Features

- **Role-Based Access Control**: Secure login portals and distinctive dashboards for Admins and Teachers.
- **Schedule Management**: Create, read, update, and delete timetables, with support for batch, section, specialization, and audience groupings.
- **Resource Management**: Extensively manage Rooms, Courses, Teachers, Batches, Sections, Specializations, and Slots.
- **Communications**: Built-in messaging and notification system for timetable changes (e.g., Slot Cancellations).
- **Comprehensive Testing**: Robust test suite covering authentication, scheduling conflicts, and data integrity using Jest and Supertest.
- **Automated Database Repair**: Robust on-startup schema validation and SQLite schema repair scripts ensuring database integrity.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (managed via Sequelize ORM)
- **Security**: bcryptjs for hashing user passwords
- **Frontend**: HTML5, CSS3, JavaScript (Interacts with the backend REST API)

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd IBIT
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Run the server:**
   ```bash
   npm start
   # or
   npm run dev
   ```
   *The server will start on `http://localhost:5000`.*

## 🧪 Testing

The project includes a comprehensive test suite to ensure scheduling logic and security constraints are maintained.

- **Run all tests:**
  ```bash
  npm test
  ```
- **Run tests with coverage report:**
  ```bash
  npm test -- --coverage
  ```
*Note: Tests use an in-memory SQLite database (`:memory:`) to ensure isolation and speed.*

## 📡 API Endpoints Overview

The backend provides a RESTful API mounted under `/api/...`

- **Auth & Users**:
  - `POST /api/admins/login` | `POST /api/admins`
  - `POST /api/teachers/login` | `GET/POST /api/teachers`
- **Academic Structure**:
  - `/api/batches` (Manage Student Batches)
  - `/api/courses` (Manage Course Details)
  - `/api/sections` (Manage Academic Sections)
  - `/api/specializations` (Manage IT, Marketing, etc.)
  - `/api/audiences` (Manage combined section groupings)
- **Logistics**:
  - `/api/rooms` (Manage Classrooms, Labs, and capacities)
  - `/api/slots` (Manage daily timeslots)
- **Core Modules**:
  - `/api/schedules` (Manage the actual timetable entries and logic)
  - `/api/communications` (Manage internal system notices)



## 📁 Folder Structure Highlight

- `backend/config/database.js`: SQLite connection, Sequelize configurations, and schema auto-repair functions.
- `backend/controllers/`: Contains the business logic for the routes (Admin, Teacher, Schedule, etc.).
- `backend/routes/`: Express router definitions mapping paths to controller methods.
- `backend/models/`: Sequelize data model declarations mapping to database tables.
- `public/`: Contains the vanilla HTML/CSS frontend templates, including `AdminLoginFrom.html`, `TeacherLoginForm.html`, and standard `tms_style.css`.

## 🛡️ Environment & Resilience

- Passwords for both the `Admin` and `Teacher` entities are hashed before storage using `bcryptjs`.
- CORS is configured in `server.js` to accept requests from `http://localhost:3000` (adjustable depending on where your frontend runs).
- The local SQLite database (`TMS(IBIT).db`) is auto-generated in the project `/db` directory if it does not already exist upon server start.
- **SQLite Resilience**: The system implements an exponential backoff retry mechanism (`withSqliteRetry`) and custom `busy_timeout` settings to handle concurrent write operations safely.