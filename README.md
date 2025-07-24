
# BSNL Complaint Management System

A web-based complaint management system for BSNL that allows customers to file complaints across different service categories (Landline, Mobile, Bharat Fibre, Prepaid, Postpaid, etc.). Admins can forward complaints to appropriate staff based on circle and department. Staff can manage, resolve, and update complaint status via a dedicated dashboard.

## Features

- User registration and login with role-based access (Customer, Admin, Staff)
- Complaint booking with department and circle selection
- Auto-assignment to staff based on circle and department
- Admin dashboard to manage users, complaints, and staff
- Staff dashboard to view and update assigned complaints
- Technician reply and resolution notes
- Complaint status tracking (New, In Progress, Resolved)
- Real-time flash messages for login, updates, and errors
- Pre-seeded staff users with hashed passwords
- Circle and department-wise service support for BSNL

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- Passport.js for authentication
- EJS for server-side rendering
- Bootstrap 4 for UI
- dotenv for environment configuration

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/sreshta-12/bsnl-complaint-portal.git
cd bsnl-complaint-portal
>>>>>>> 757a752 (🎉 Initial commit: BSNL Complaint Management System)
