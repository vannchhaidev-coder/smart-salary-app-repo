# Smart Salary App

A comprehensive **Salary Advance Management System** built with Next.js, featuring intelligent loan evaluation, automated payroll processing, and real-time financial analytics.

![Status](https://img.shields.io/badge/status-active-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [Contributing](#-contributing)

---

## ✨ Features

### Employee Portal
- **Loan Management** - Request salary advances with automated risk assessment
- **Wallet System** - Real-time balance tracking and transaction history
- **Financial Dashboard** - Personal financial health metrics and insights
- **Badge System** - Performance-based recognition (Excellent, Good, Fair, Poor)

### Admin Dashboard
- **Employee Management** - CRUD operations for employee records
- **Loan Approval Workflow** - Manual review with AI-powered recommendations
- **Payroll Processing** - Bulk salary processing with validation
- **Analytics & Reporting** - Loan volume, risk distribution, department breakdowns
- **Audit Trail** - Complete transaction history and reversal capabilities

### Smart Features
- **Risk Scoring Engine** - Automated evaluation based on attendance, debt, and history
- **Auto-Approval System** - Instant approval for low-risk requests
- **Automated Deductions** - Monthly loan repayments integrated with payroll
- **Salary Generation** - Automated monthly salary record creation

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **UI Components** | shadcn/ui, Radix UI, Tailwind CSS |
| **State Management** | React Context, Custom Hooks |
| **Validation** | Zod schemas |
| **Backend** | Spring Boot (REST API) |
| **Database** | PostgreSQL |
| **Package Manager** | pnpm |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (`npm install -g pnpm`)
- Backend server running (Spring Boot)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd smart_salary_app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Configuration

Update the API base URL in `lib/utils.ts` or configure via environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

---

## 📁 Project Structure

```
smart_salary_app/
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Public-facing pages (login, employee portal)
│   ├── (admin)/           # Admin dashboard pages
│   └── api/               # API routes (if any)
├── components/
│   ├── ui/                # shadcn/ui base components
│   └── custom/            # Custom business components
├── lib/
│   ├── types.ts           # TypeScript interfaces
│   ├── schemas.ts         # Zod validation schemas
│   ├── mock-data.ts       # Development mock data
│   ├── auth-context.tsx   # Authentication provider
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
├── public/                # Static assets
└── styles/                # Global styles
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/refresh` | Refresh access token |

### Employee Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/employees` | List employees (paginated) |
| `GET` | `/api/v1/employees/{id}` | Get employee details |
| `POST` | `/api/v1/employees` | Create employee |
| `PUT` | `/api/v1/employees/{id}` | Update employee |
| `DELETE` | `/api/v1/employees/{id}` | Delete employee |

### Loan Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/loans` | List loans (paginated) |
| `GET` | `/api/v1/loans/{id}` | Get loan details |
| `POST` | `/api/v1/loans` | Create loan request |
| `PUT` | `/api/v1/loans/{id}` | Update loan |
| `DELETE` | `/api/v1/loans/{id}` | Delete loan |
| `POST` | `/api/v1/loans/{id}/approve` | Approve loan |
| `GET` | `/api/v1/loans/{id}/transactions` | Get loan transactions |

### Smart Feature Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/loans/evaluate` | Evaluate loan risk & approval |
| `GET` | `/api/employees/{id}/risk` | Get employee risk score |
| `POST` | `/api/payroll/deduct` | Apply monthly deductions |

### Wallet & Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/wallet` | Get current user wallet |
| `GET` | `/api/wallet/{employeeId}` | Get employee wallet |
| `POST` | `/api/wallet/transaction` | Create transaction |
| `GET` | `/api/v1/wallet/{employeeId}/balance` | Get wallet balance |
| `GET` | `/api/v1/wallet/{employeeId}/transactions` | Get transaction history |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/analytics/summary` | Get dashboard summary |
| `GET` | `/api/v1/analytics/loans` | Get loan analytics |

### Salary Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/salary-records` | List salary records |
| `GET` | `/api/v1/salary-records/{id}` | Get salary details |
| `POST` | `/api/v1/salary-records/{id}/process` | Process single salary |
| `POST` | `/api/v1/salary-records/bulk-process` | Bulk process salaries |
| `POST` | `/api/v1/salary-records/generate` | Generate monthly records |
| `GET` | `/api/v1/salary-records/month/{month}/summary` | Get monthly summary |
| `GET` | `/api/v1/salary-records/employee/{id}/deductions` | Get deductions |
| `POST` | `/api/v1/salary-records/{id}/validate` | Validate before processing |
| `POST` | `/api/v1/salary-records/{id}/reverse` | Reverse processed salary |
| `GET` | `/api/v1/salary-records/export` | Export to CSV/JSON |

### Query Parameters

**Pagination** (supported on list endpoints):
- `page` (integer, default: 0) - Page number (0-based)
- `size` (integer, default: 10) - Items per page

**Filters** (salary records):
- `month` (string, format: YYYY-MM) - Filter by month
- `department` (string) - Filter by department
- `status` (string) - Filter by status

---

## 💾 Database Schema

### Core Tables

**employees** - Employee records with financial metrics
- Personal info (name, email, department, position)
- Financial data (salary, wallet_balance, existing_debt)
- Metrics (attendance_rate, financial_health_score, risk_score, badge)

**loans** - Loan applications and status
- Loan details (amount, reason, repayment_months)
- Status tracking (pending/approved/rejected/repaying/completed)
- Risk assessment (risk_score, risk_level, monthly_deduction)
- Approval tracking (approved_by, approved_date)

**transactions** - Financial transaction history
- Transaction types (salary, deduction, repayment, bonus)
- Links to employee and optional loan

**salary_records** - Monthly payroll records
- Salary components (base_salary, allowances, deductions)
- Status tracking (pending/processed/failed/reversed)
- Payment details (payable_date, payment_method, payment_reference)

**deduction_details** - Loan deduction breakdown per salary
- Links salary records to specific loan deductions

**payroll_audit_logs** - Admin action audit trail
- Tracks create, update, process, reverse, export actions
- Stores previous and new state snapshots

### Schema Diagram

View the interactive diagram at [dbdiagram.io](https://dbdiagram.io) using the schema definition in the original README.

---

## 🔐 Authentication

All admin endpoints require Bearer token authentication.

### Obtaining a Token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your-password"
}
```

### Using the Token

Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

### Token Refresh

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<your-refresh-token>"
}
```

---

## 📊 Sample Response Formats

### Pagination Response

```json
{
  "data": [...],
  "pagination": {
    "page": 0,
    "size": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Employee Response

```json
{
  "id": "f8f0da22-c579-4ec4-93d2-4a372ebd9f3a",
  "employeeCode": "EMP001",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "ADMIN",
  "department": "IT",
  "position": "Software Engineer",
  "salary": 1500.0,
  "walletBalance": 1350.0,
  "financialHealthScore": 80,
  "attendanceRate": 95,
  "riskScore": 39,
  "badge": "EXCELLENT"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_WALLET_BALANCE",
    "message": "Employee wallet balance is insufficient",
    "details": {
      "currentBalance": 50.0,
      "requiredDeduction": 333.33,
      "shortfall": 283.33
    }
  }
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Use TypeScript for all new code
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Support

For issues and questions:
- Create an issue in this repository
- Contact the development team

---

**Happy Coding!** 😊
