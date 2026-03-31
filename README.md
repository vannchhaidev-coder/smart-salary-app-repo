# Salary Advance System Frontend

This repository contains the **Next.js** front‑end for a Salary Advance System. It provides user interfaces for employees to request advances, view their loan status, and manage transactions, along with an admin dashboard for managing employees, loans, and analytics.

## 🗂 Project Structure

- `app/` – Next.js pages for public, admin, and dashboard areas
- `components/` – Reusable UI components, including a custom `ui` library
- `lib/` – Utility functions, data types, schemas, mock data, and auth context
- `hooks/` – Custom React hooks
- `public/` and `styles/` – Static assets and global styles

## 🚀 Development

Install dependencies with pnpm and run the dev server:

```bash
pnpm install
pnpm dev
```

## 🧩 Backend API (Spring Boot)

The front‑end communicates with a REST API. Below are the complete API specifications for all endpoints used in the application.

### Authentication

```
POST /api/auth/login
POST /api/auth/refresh
```

### Employees

```
GET    /api/v1/employees?page=0&size=10
GET    /api/v1/employees/{id}
POST   /api/v1/employees
PUT    /api/v1/employees/{id}
DELETE /api/v1/employees/{id}
```

### Loans

```
GET    /api/v1/loans?page=0&size=10
GET    /api/v1/loans/{id}
POST   /api/v1/loans
PUT    /api/v1/loans/{id}
DELETE /api/v1/loans/{id}
POST   /api/v1/loans/{id}/approve
GET    /api/v1/loans/{id}/transactions
```

### Wallet

```
GET    /api/wallet
GET    /api/wallet/{employeeId}
POST   /api/wallet/transaction
GET    /api/v1/wallet/{employeeId}/balance
GET    /api/v1/wallet/{employeeId}/transactions
```

### Analytics

```
GET /api/v1/analytics/summary
GET /api/v1/analytics/loans
```

### Salary Management (Admin)

```
GET    /api/v1/salary-records?page=0&size=10&month=2026-03&department=IT&status=pending
GET    /api/v1/salary-records/{id}
POST   /api/v1/salary-records/process
POST   /api/v1/salary-records/{id}/process
POST   /api/v1/salary-records/bulk-process
GET    /api/v1/salary-records/{id}/details
POST   /api/v1/salary-records/generate
GET    /api/v1/salary-records/month/{month}/summary
```

---

## 🔧 API Examples

Below are example request/response payloads for the REST endpoints. These are meant as a guide for the backend implementation.

### Employees

_GET /api/v1/employees?page=0&size=10_ **response**

```json
{
  "data": [
    {
      "id": "03591ebc-2d72-4db0-9cb7-2879df423d98",
      "employeeCode": "EMP003",
      "name": "Vann Chhai",
      "email": "vannchhai-dev@gmail.com",
      "role": "EMPLOYEE",
      "department": "IT",
      "position": "Software Engineer",
      "joinDate": null,
      "salary": 0,
      "walletBalance": 1350.0,
      "financialHealthScore": 0,
      "attendanceRate": 0,
      "riskScore": 0,
      "badge": "EXCELLENT"
    },
    {
      "id": "28a15c67-6d12-43ce-8329-934b1464e40b",
      "employeeCode": "EMP002",
      "name": "Normal User",
      "email": "user@example.com",
      "role": "USER",
      "department": "HR",
      "position": "HR Manager",
      "joinDate": null,
      "salary": 1200.0,
      "walletBalance": 1350.0,
      "financialHealthScore": 90,
      "attendanceRate": 9,
      "riskScore": 44,
      "badge": "EXCELLENT"
    },
    {
      "id": "f8f0da22-c579-4ec4-93d2-4a372ebd9f3a",
      "employeeCode": "EMP001",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "department": "IT",
      "position": "Software Engineer",
      "joinDate": null,
      "salary": 1500.0,
      "walletBalance": 1350.0,
      "financialHealthScore": 80,
      "attendanceRate": 9,
      "riskScore": 39,
      "badge": "EXCELLENT"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

_POST /api/v1/employees_ **request**

```json
{
  "name": "New Employee",
  "email": "new@company.com",
  "department": "Sales",
  "position": "Sales Representative",
  "salary": 2500
}
```

### Loans

_GET /api/v1/loans?page=0&size=10_ **response**

```json
{
  "data": [
    {
      "id": "loan-001",
      "employeeId": "emp-001",
      "employeeName": "Sokha Chan",
      "department": "Engineering",
      "amount": 1000,
      "reason": "Medical emergency",
      "requestDate": "2026-03-01",
      "status": "approved",
      "riskScore": 88,
      "riskLevel": "low",
      "repaymentMonths": 3,
      "monthlyDeduction": 333.33,
      "remainingBalance": 666.67,
      "approvedBy": "admin-001",
      "approvedDate": "2026-03-02"
    },
    {
      "id": "loan-002",
      "employeeId": "emp-002",
      "employeeName": "Dara Kim",
      "department": "Marketing",
      "amount": 800,
      "reason": "Home repair",
      "requestDate": "2026-03-10",
      "status": "pending",
      "riskScore": 75,
      "riskLevel": "medium",
      "repaymentMonths": 4,
      "monthlyDeduction": 200,
      "remainingBalance": 800
    }
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

_POST /api/v1/loans_ **request**

```json
{
  "employeeId": "emp-002",
  "amount": 800,
  "reason": "Home repair",
  "repaymentMonths": 4
}
```

### Analytics

_GET /api/v1/analytics/summary_ **response**

```json
{
  "totalLoansIssued": 12,
  "totalOutstanding": 4500,
  "approvalRate": 85,
  "repaymentRate": 94
}
```

_GET /api/v1/analytics/loans_ **response**

```json
{
  "monthlyLoanVolume": [
    { "month": "Sep", "amount": 2200, "count": 3 },
    { "month": "Oct", "amount": 3100, "count": 4 },
    { "month": "Nov", "amount": 2800, "count": 3 },
    { "month": "Dec", "amount": 1800, "count": 2 },
    { "month": "Jan", "amount": 3500, "count": 4 },
    { "month": "Feb", "amount": 2400, "count": 3 }
  ],
  "riskDistribution": [
    { "level": "Low Risk (80-100)", "count": 3 },
    { "level": "Medium Risk (50-79)", "count": 3 },
    { "level": "High Risk (0-49)", "count": 2 }
  ],
  "departmentLoans": [
    { "department": "Engineering", "amount": 2400 },
    { "department": "Marketing", "amount": 800 },
    { "department": "Finance", "amount": 1500 },
    { "department": "Sales", "amount": 1200 },
    { "department": "HR", "amount": 600 },
    { "department": "Operations", "amount": 2000 }
  ]
}
```

### Wallet

_GET /api/v1/wallet/{employeeId}/balance_ **response**

```json
{
  "employeeId": "emp-001",
  "balance": 1200,
  "availableBalance": 800,
  "pendingDeductions": 400
}
```

_GET /api/v1/wallet/{employeeId}/transactions_ **response**

```json
{
  "data": [
    {
      "id": "txn-001",
      "employeeId": "emp-001",
      "type": "advance",
      "amount": 1000,
      "description": "Salary advance approved",
      "date": "2026-03-01",
      "balance": 2200
    },
    {
      "id": "txn-002",
      "employeeId": "emp-001",
      "type": "deduction",
      "amount": 333.33,
      "description": "Monthly loan repayment",
      "date": "2026-03-15",
      "balance": 1866.67
    }
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## 🔧 Smart Feature Endpoints

In addition to the basic CRUD routes above, the backend should expose endpoints that support the system's intelligent behavior:

- `POST /api/loans/evaluate` – Accepts loan request data and returns a risk score plus approval recommendation. The body might include attendance rate, existing debt, salary stability, etc. The response would include `riskScore` and `riskLevel` along with `autoApproved` boolean.

- `GET /api/employees/{id}/risk` – Returns the computed risk score for an employee, used by admin dashboards and approval widgets.

- `POST /api/payroll/deduct` – Called by payroll processing to apply monthly deductions for all active loans. The request could send the pay period and the system responds with a list of deductions applied.

These endpoints encapsulate the risk scoring engine, auto‑approval logic, and automated deduction process described in the project proposal. The front‑end UI currently assumes that risk scores and monthly deduction amounts are provided directly in the loan objects, but a real implementation would call these specialized routes when creating or processing loans.

---

## 💼 Salary Management Admin API Examples

Below are detailed example request/response payloads for the Salary Management Admin endpoints.

### Get All Salary Records

_GET /api/v1/salary-records?page=0&size=10&month=2026-03&department=IT&status=pending_ **response**

```json
{
  "data": [
    {
      "id": "sal-rec-001",
      "employeeId": "f8f0da22-c579-4ec4-93d2-4a372ebd9f3a",
      "employeeCode": "EMP001",
      "employeeName": "Admin User",
      "department": "IT",
      "position": "Software Engineer",
      "month": "2026-03",
      "baseSalary": 1500.0,
      "allowances": {
        "housing": 200.0,
        "transport": 100.0,
        "meal": 150.0,
        "other": 50.0
      },
      "grossSalary": 2000.0,
      "deductions": {
        "loanRepayments": 333.33,
        "tax": 150.0,
        "insurance": 50.0,
        "advanceRecovery": 0,
        "other": 0
      },
      "totalDeductions": 533.33,
      "netSalary": 1466.67,
      "status": "pending",
      "payableDate": "2026-03-28",
      "processedAt": null,
      "processedBy": null,
      "createdAt": "2026-03-01T00:00:00Z",
      "updatedAt": "2026-03-01T00:00:00Z"
    },
    {
      "id": "sal-rec-002",
      "employeeId": "28a15c67-6d12-43ce-8329-934b1464e40b",
      "employeeCode": "EMP002",
      "employeeName": "Normal User",
      "department": "IT",
      "position": "HR Manager",
      "month": "2026-03",
      "baseSalary": 1200.0,
      "allowances": {
        "housing": 150.0,
        "transport": 80.0,
        "meal": 120.0,
        "other": 0
      },
      "grossSalary": 1550.0,
      "deductions": {
        "loanRepayments": 200.0,
        "tax": 100.0,
        "insurance": 40.0,
        "advanceRecovery": 50.0,
        "other": 0
      },
      "totalDeductions": 390.0,
      "netSalary": 1160.0,
      "status": "pending",
      "payableDate": "2026-03-28",
      "processedAt": null,
      "processedBy": null,
      "createdAt": "2026-03-01T00:00:00Z",
      "updatedAt": "2026-03-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "total": 2,
    "totalPages": 1
  },
  "summary": {
    "totalBaseSalary": 2700.0,
    "totalGrossSalary": 3550.0,
    "totalDeductions": 923.33,
    "totalNetSalary": 2626.67,
    "pendingCount": 2,
    "processedCount": 0
  }
}
```

### Get Salary Record Details

_GET /api/v1/salary-records/{id}_ **response**

```json
{
  "id": "sal-rec-001",
  "employeeId": "f8f0da22-c579-4ec4-93d2-4a372ebd9f3a",
  "employeeCode": "EMP001",
  "employeeName": "Admin User",
  "department": "IT",
  "position": "Software Engineer",
  "email": "admin@example.com",
  "month": "2026-03",
  "baseSalary": 1500.0,
  "allowances": {
    "housing": 200.0,
    "transport": 100.0,
    "meal": 150.0,
    "other": 50.0,
    "total": 450.0
  },
  "grossSalary": 2000.0,
  "deductions": {
    "loanRepayments": 333.33,
    "tax": 150.0,
    "insurance": 50.0,
    "advanceRecovery": 0,
    "other": 0,
    "total": 533.33
  },
  "netSalary": 1466.67,
  "status": "pending",
  "payableDate": "2026-03-28",
  "processedAt": null,
  "processedBy": null,
  "breakdown": {
    "attendanceDays": 22,
    "totalWorkingDays": 22,
    "attendanceRate": 100,
    "workingDays": [
      { "date": "2026-03-01", "status": "present", "hours": 8 },
      { "date": "2026-03-02", "status": "present", "hours": 8 }
    ],
    "leaves": {
      "sick": 0,
      "vacation": 0,
      "unpaid": 0
    },
    "overtime": {
      "hours": 5,
      "rate": 20.0,
      "amount": 100.0
    }
  },
  "activeLoans": [
    {
      "loanId": "loan-001",
      "type": "salary_advance",
      "principalAmount": 1000.0,
      "remainingBalance": 666.67,
      "monthlyDeduction": 333.33,
      "repaymentMonths": 3,
      "monthsCompleted": 1
    }
  ],
  "previousSalary": {
    "month": "2026-02",
    "netSalary": 1466.67,
    "status": "processed",
    "processedAt": "2026-02-28T10:00:00Z"
  },
  "createdAt": "2026-03-01T00:00:00Z",
  "updatedAt": "2026-03-01T00:00:00Z"
}
```

### Process Single Salary Record

_POST /api/v1/salary-records/{id}/process_ **request**

```json
{
  "processedBy": "admin-001",
  "notes": "Salary processed for March 2026",
  "skipValidation": false
}
```

_POST /api/v1/salary-records/sal-rec-001/process_ **response**

```json
{
  "success": true,
  "message": "Salary record processed successfully",
  "data": {
    "id": "sal-rec-001",
    "employeeId": "f8f0da22-c579-4ec4-93d2-4a372ebd9f3a",
    "employeeName": "Admin User",
    "month": "2026-03",
    "netSalary": 1466.67,
    "status": "processed",
    "processedAt": "2026-03-24T10:30:00Z",
    "processedBy": "admin-001",
    "transactionId": "txn-sal-001",
    "paymentMethod": "bank_transfer",
    "paymentReference": "PAY-2026-03-001"
  },
  "walletUpdate": {
    "previousBalance": 1350.0,
    "creditedAmount": 1466.67,
    "newBalance": 2816.67
  },
  "deductionsApplied": [
    {
      "loanId": "loan-001",
      "amount": 333.33,
      "remainingBalance": 333.34
    }
  ]
}
```

### Bulk Process All Pending Salaries

_POST /api/v1/salary-records/bulk-process_ **request**

```json
{
  "month": "2026-03",
  "department": "IT",
  "processedBy": "admin-001",
  "notes": "Bulk processing for March 2026 payroll",
  "validateAll": true
}
```

_POST /api/v1/salary-records/bulk-process_ **response**

```json
{
  "success": true,
  "message": "Bulk salary processing completed",
  "summary": {
    "totalProcessed": 15,
    "successful": 14,
    "failed": 1,
    "totalAmount": 21950.05,
    "totalDeductions": 2845.5,
    "netPayable": 19104.55
  },
  "processed": [
    {
      "salaryRecordId": "sal-rec-001",
      "employeeId": "f8f0da22-c579-4ec4-93d2-4a372ebd9f3a",
      "employeeName": "Admin User",
      "netSalary": 1466.67,
      "status": "processed",
      "transactionId": "txn-sal-001"
    },
    {
      "salaryRecordId": "sal-rec-002",
      "employeeId": "28a15c67-6d12-43ce-8329-934b1464e40b",
      "employeeName": "Normal User",
      "netSalary": 1160.0,
      "status": "processed",
      "transactionId": "txn-sal-002"
    }
  ],
  "failed": [
    {
      "salaryRecordId": "sal-rec-003",
      "employeeId": "03591ebc-2d72-4db0-9cb7-2879df423d98",
      "employeeName": "Vann Chhai",
      "reason": "Insufficient wallet balance for deduction",
      "errorCode": "INSUFFICIENT_FUNDS"
    }
  ],
  "processedAt": "2026-03-24T10:35:00Z",
  "processedBy": "admin-001"
}
```

### Generate Salary Records for Month

_POST /api/v1/salary-records/generate_ **request**

```json
{
  "month": "2026-03",
  "year": 2026,
  "department": null,
  "includeActiveEmployeesOnly": true,
  "calculateDeductions": true
}
```

_POST /api/v1/salary-records/generate_ **response**

```json
{
  "success": true,
  "message": "Salary records generated successfully",
  "data": {
    "month": "2026-03",
    "generatedAt": "2026-03-24T09:00:00Z",
    "generatedBy": "admin-001",
    "totalRecords": 25,
    "newRecords": 5,
    "updatedRecords": 20,
    "summary": {
      "totalBaseSalary": 37500.0,
      "totalAllowances": 5625.0,
      "totalGrossSalary": 43125.0,
      "totalDeductions": 5606.25,
      "totalNetSalary": 37518.75
    }
  },
  "records": [
    {
      "id": "sal-rec-001",
      "employeeId": "f8f0da22-c579-4ec4-93d2-4a372ebd9f3a",
      "employeeName": "Admin User",
      "baseSalary": 1500.0,
      "grossSalary": 2000.0,
      "totalDeductions": 533.33,
      "netSalary": 1466.67,
      "status": "pending",
      "action": "updated"
    },
    {
      "id": "sal-rec-025",
      "employeeId": "new-employee-001",
      "employeeName": "New Employee",
      "baseSalary": 1800.0,
      "grossSalary": 2100.0,
      "totalDeductions": 210.0,
      "netSalary": 1890.0,
      "status": "pending",
      "action": "created"
    }
  ]
}
```

### Get Monthly Salary Summary

_GET /api/v1/salary-records/month/2026-03/summary_ **response**

```json
{
  "month": "2026-03",
  "year": 2026,
  "generatedAt": "2026-03-01T00:00:00Z",
  "lastUpdated": "2026-03-24T10:35:00Z",
  "overview": {
    "totalEmployees": 25,
    "activeEmployees": 23,
    "recordsProcessed": 20,
    "recordsPending": 5,
    "processingProgress": 80
  },
  "financials": {
    "totalBaseSalary": 37500.0,
    "totalAllowances": 5625.0,
    "totalGrossSalary": 43125.0,
    "totalDeductions": {
      "loanRepayments": 4250.0,
      "tax": 1125.0,
      "insurance": 187.5,
      "advanceRecovery": 43.75,
      "other": 0,
      "total": 5606.25
    },
    "totalNetSalary": 37518.75,
    "averageSalary": 1875.94
  },
  "departmentBreakdown": [
    {
      "department": "IT",
      "employeeCount": 10,
      "totalBaseSalary": 15000.0,
      "totalNetSalary": 13500.0
    },
    {
      "department": "HR",
      "employeeCount": 5,
      "totalBaseSalary": 6000.0,
      "totalNetSalary": 5400.0
    },
    {
      "department": "Sales",
      "employeeCount": 6,
      "totalBaseSalary": 9000.0,
      "totalNetSalary": 8100.0
    },
    {
      "department": "Operations",
      "employeeCount": 4,
      "totalBaseSalary": 7500.0,
      "totalNetSalary": 6750.0
    }
  ],
  "deductionBreakdown": {
    "employeesWithLoans": 15,
    "totalLoanDeductions": 4250.0,
    "employeesWithAdvances": 3,
    "totalAdvanceDeductions": 43.75
  },
  "statusDistribution": {
    "processed": 20,
    "pending": 5,
    "failed": 0
  },
  "processingHistory": [
    {
      "processedAt": "2026-03-24T10:35:00Z",
      "processedBy": "admin-001",
      "recordsProcessed": 14,
      "status": "success"
    },
    {
      "processedAt": "2026-03-24T09:15:00Z",
      "processedBy": "admin-002",
      "recordsProcessed": 6,
      "status": "success"
    }
  ]
}
```

### Get Deduction Breakdown for Employee

_GET /api/v1/salary-records/employee/{employeeId}/deductions?month=2026-03_ **response**

```json
{
  "employeeId": "f8f0da22-c579-4ec4-93d2-4a372ebd9f3a",
  "employeeName": "Admin User",
  "month": "2026-03",
  "baseSalary": 1500.0,
  "grossSalary": 2000.0,
  "deductions": {
    "loanRepayments": [
      {
        "loanId": "loan-001",
        "loanType": "salary_advance",
        "originalAmount": 1000.0,
        "remainingBalance": 666.67,
        "monthlyDeduction": 333.33,
        "deductionAmount": 333.33,
        "monthsRemaining": 2
      },
      {
        "loanId": "loan-005",
        "loanType": "personal_loan",
        "originalAmount": 500.0,
        "remainingBalance": 250.0,
        "monthlyDeduction": 100.0,
        "deductionAmount": 100.0,
        "monthsRemaining": 2
      }
    ],
    "tax": {
      "taxableIncome": 1850.0,
      "taxRate": 0.1,
      "taxAmount": 150.0
    },
    "insurance": {
      "type": "health_insurance",
      "premium": 50.0
    },
    "advanceRecovery": {
      "totalAdvance": 0,
      "recoveryAmount": 0
    },
    "other": []
  },
  "totalDeductions": 533.33,
  "netSalary": 1466.67,
  "calculatedAt": "2026-03-24T10:30:00Z"
}
```

### Validate Salary Before Processing

_POST /api/v1/salary-records/{id}/validate_ **request**

```json
{
  "month": "2026-03"
}
```

_POST /api/v1/salary-records/sal-rec-001/validate_ **response**

```json
{
  "success": true,
  "salaryRecordId": "sal-rec-001",
  "employeeId": "f8f0da22-c579-4ec4-93d2-4a372ebd9f3a",
  "employeeName": "Admin User",
  "isValid": true,
  "validationResults": {
    "attendanceValidated": true,
    "loanDeductionsCalculated": true,
    "taxCalculated": true,
    "walletBalanceSufficient": true,
    "noBlockingIssues": true
  },
  "warnings": [],
  "errors": [],
  "readyToProcess": true,
  "validatedAt": "2026-03-24T10:30:00Z"
}
```

_POST /api/v1/salary-records/sal-rec-003/validate_ **response with errors**

```json
{
  "success": false,
  "salaryRecordId": "sal-rec-003",
  "employeeId": "03591ebc-2d72-4db0-9cb7-2879df423d98",
  "employeeName": "Vann Chhai",
  "isValid": false,
  "validationResults": {
    "attendanceValidated": true,
    "loanDeductionsCalculated": true,
    "taxCalculated": true,
    "walletBalanceSufficient": false,
    "noBlockingIssues": false
  },
  "warnings": [
    {
      "code": "HIGH_DEDUCTION_RATIO",
      "message": "Total deductions exceed 30% of gross salary",
      "severity": "warning"
    }
  ],
  "errors": [
    {
      "code": "INSUFFICIENT_WALLET_BALANCE",
      "message": "Employee wallet balance is insufficient for loan deductions",
      "severity": "error",
      "details": {
        "currentBalance": 50.0,
        "requiredDeduction": 333.33,
        "shortfall": 283.33
      }
    }
  ],
  "readyToProcess": false,
  "validatedAt": "2026-03-24T10:30:00Z"
}
```

### Reverse/Refund Processed Salary

_POST /api/v1/salary-records/{id}/reverse_ **request**

```json
{
  "reason": "Incorrect salary amount - needs recalculation",
  "reversedBy": "admin-001",
  "notifyEmployee": true
}
```

_POST /api/v1/salary-records/sal-rec-001/reverse_ **response**

```json
{
  "success": true,
  "message": "Salary record reversed successfully",
  "data": {
    "salaryRecordId": "sal-rec-001",
    "employeeId": "f8f0da22-c579-4ec4-93d2-4a372ebd9f3a",
    "employeeName": "Admin User",
    "previousStatus": "processed",
    "newStatus": "pending",
    "reversedAt": "2026-03-24T11:00:00Z",
    "reversedBy": "admin-001"
  },
  "reversalDetails": {
    "walletReversed": true,
    "previousWalletBalance": 2816.67,
    "reversedAmount": 1466.67,
    "newWalletBalance": 1350.0,
    "deductionsReversed": true,
    "transactionReversed": "txn-sal-001"
  },
  "notification": {
    "employeeNotified": true,
    "notificationSentAt": "2026-03-24T11:00:05Z"
  }
}
```

### Export Salary Records

_GET /api/v1/salary-records/export?month=2026-03&format=csv&department=IT_ **response**

Returns a file download response with the exported data.

**CSV Format Example:**

```csv
Employee Code,Employee Name,Department,Position,Base Salary,Allowances,Gross Salary,Loan Deductions,Tax,Insurance,Total Deductions,Net Salary,Status,Processed Date
EMP001,Admin User,IT,Software Engineer,1500.00,450.00,2000.00,333.33,150.00,50.00,533.33,1466.67,processed,2026-03-24
EMP002,Normal User,IT,HR Manager,1200.00,350.00,1550.00,200.00,100.00,40.00,390.00,1160.00,processed,2026-03-24
```

**JSON Export Format:**

```json
{
  "exportedAt": "2026-03-24T11:30:00Z",
  "month": "2026-03",
  "format": "json",
  "totalRecords": 25,
  "data": [
    {
      "employeeCode": "EMP001",
      "employeeName": "Admin User",
      "department": "IT",
      "baseSalary": 1500.0,
      "netSalary": 1466.67,
      "status": "processed"
    }
  ]
}
```

---

## 📊 Salary Management Error Responses

### Common Error Codes

_400 Bad Request_

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "month",
        "message": "Month must be in YYYY-MM format"
      }
    ]
  }
}
```

_404 Not Found_

```json
{
  "success": false,
  "error": {
    "code": "SALARY_RECORD_NOT_FOUND",
    "message": "Salary record with ID 'sal-rec-999' not found"
  }
}
```

_409 Conflict_

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_PROCESSED",
    "message": "Salary record has already been processed",
    "details": {
      "salaryRecordId": "sal-rec-001",
      "processedAt": "2026-03-24T10:30:00Z",
      "processedBy": "admin-001"
    }
  }
}
```

_500 Internal Server Error_

```json
{
  "success": false,
  "error": {
    "code": "PROCESSING_FAILED",
    "message": "Failed to process salary record due to system error",
    "details": {
      "salaryRecordId": "sal-rec-001",
      "reason": "Wallet service unavailable"
    }
  }
}
```

---

## 📄 Pagination

All list endpoints support pagination with the following query parameters:

- `page` (integer, default: 0) - Page number (0-based)
- `size` (integer, default: 10) - Number of items per page
- Additional filters may be supported (e.g., `status`, `employeeId`)

**Response Structure:**

```json
{
  "data": [
    /* array of items */
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "totalElements": 25,
    "totalPages": 3
  }
}
```

**Pagination is implemented on the backend** to ensure:

- Efficient database queries
- Consistent API behavior
- Proper resource management
- Support for large datasets

The frontend handles pagination UI (page navigation, size selection) but delegates data fetching and filtering to the backend.

---

---

## 💾 Database Schema (dbdiagram)

You can visualize this schema at [dbdiagram.io](https://dbdiagram.io/) by copying the code below:

```dbml
Table employees {
  id varchar [pk]
  name varchar [not null]
  email varchar [unique, not null]
  password_hash varchar
  department varchar
  position varchar
  salary decimal
  join_date date
  wallet_balance decimal [default: 0]
  attendance_rate int [default: 80]
  repayment_history int [default: 0]
  existing_debt decimal [default: 0]
  financial_health_score int [default: 50]
  risk_score int [default: 50]
  badge varchar [note: "Excellent, Good, Fair, Poor"]
  status varchar [default: "active"]
  created_at timestamp
  updated_at timestamp
}

Table admins {
  id varchar [pk]
  name varchar [not null]
  email varchar [unique, not null]
  password_hash varchar
  department varchar
  position varchar
  created_at timestamp
}

Table loans {
  id varchar [pk]
  employee_id varchar [not null, ref: > employees.id]
  amount decimal [not null]
  reason varchar
  request_date date
  status varchar [note: "pending, approved, rejected, repaying, completed"]
  risk_score int
  risk_level varchar [note: "low, medium, high"]
  repayment_months int
  monthly_deduction decimal
  remaining_balance decimal
  approved_by_admin_id varchar [ref: > admins.id]
  approved_date date
  approval_reason varchar
  created_at timestamp
  updated_at timestamp
}

Table transactions {
  id varchar [pk]
  employee_id varchar [not null, ref: > employees.id]
  loan_id varchar [ref: > loans.id]
  transaction_date date
  description varchar
  type varchar [note: "salary, deduction, repayment, bonus"]
  amount decimal
  created_at timestamp
  Indexes {
    (employee_id, transaction_date)
  }
}

Table salary_records {
  id varchar [pk]
  employee_id varchar [not null, ref: > employees.id]
  employee_code varchar
  employee_name varchar
  department varchar
  position varchar
  month_year date [not null]
  base_salary decimal [not null]
  allowances_housing decimal [default: 0]
  allowances_transport decimal [default: 0]
  allowances_meal decimal [default: 0]
  allowances_other decimal [default: 0]
  gross_salary decimal [not null]
  deduction_loan_repayments decimal [default: 0]
  deduction_tax decimal [default: 0]
  deduction_insurance decimal [default: 0]
  deduction_advance_recovery decimal [default: 0]
  deduction_other decimal [default: 0]
  total_deductions decimal [not null]
  net_salary decimal [not null]
  status varchar [default: "pending", note: "pending, processed, failed, reversed"]
  payable_date date
  processed_at timestamp
  processed_by varchar [ref: > admins.id]
  payment_method varchar [note: "bank_transfer, cash, check"]
  payment_reference varchar
  reversal_reason varchar
  reversed_at timestamp
  reversed_by varchar [ref: > admins.id]
  notes text
  created_at timestamp
  updated_at timestamp

  Indexes {
    (employee_id, month_year) unique
    (status)
    (month_year, department)
  }
}

Table deduction_details {
  id varchar [pk]
  salary_record_id varchar [not null, ref: > salary_records.id]
  loan_id varchar [not null, ref: > loans.id]
  deduction_amount decimal
  created_at timestamp
}

Table payroll_audit_logs {
  id varchar [pk]
  salary_record_id varchar [ref: > salary_records.id]
  admin_id varchar [ref: > admins.id]
  action varchar [note: "create, update, process, reverse, export"]
  previous_state json
  new_state json
  timestamp timestamp
  ip_address varchar
  user_agent varchar
}
```

**Schema Relationships:**

- Each `employee` can have multiple `loans`, `transactions`, and `salary_records`
- Each `loan` belongs to one employee and references an approving admin
- Each `salary_record` tracks monthly payroll and links to deduction details
- Each `deduction_detail` connects a salary record to a specific loan's deduction amount
- Each `transaction` tracks financial activity per employee and optionally per loan
- Each `payroll_audit_logs` entry tracks admin actions on salary records

---

## 📋 Salary Management Quick Reference

### Endpoint Summary

| Method | Endpoint                                          | Description                                       |
| ------ | ------------------------------------------------- | ------------------------------------------------- |
| `GET`  | `/api/v1/salary-records`                          | List all salary records with pagination & filters |
| `GET`  | `/api/v1/salary-records/{id}`                     | Get detailed salary record information            |
| `POST` | `/api/v1/salary-records/{id}/process`             | Process a single salary record                    |
| `POST` | `/api/v1/salary-records/bulk-process`             | Process all pending salaries in bulk              |
| `POST` | `/api/v1/salary-records/generate`                 | Generate salary records for a month               |
| `GET`  | `/api/v1/salary-records/month/{month}/summary`    | Get monthly payroll summary                       |
| `GET`  | `/api/v1/salary-records/employee/{id}/deductions` | Get employee deduction breakdown                  |
| `POST` | `/api/v1/salary-records/{id}/validate`            | Validate salary before processing                 |
| `POST` | `/api/v1/salary-records/{id}/reverse`             | Reverse a processed salary                        |
| `GET`  | `/api/v1/salary-records/export`                   | Export salary records to CSV/JSON                 |

### Query Parameters

**List Endpoint:**

- `page` (integer, default: 0) - Page number
- `size` (integer, default: 10) - Items per page
- `month` (string, format: YYYY-MM) - Filter by month
- `department` (string) - Filter by department
- `status` (string) - Filter by status (pending, processed, failed, reversed)

### Status Values

- `pending` - Salary record created but not yet processed
- `processed` - Salary has been paid to employee
- `failed` - Processing failed due to errors
- `reversed` - Previously processed salary was reversed

### Common Use Cases

**1. Monthly Payroll Processing Flow:**

```
1. Generate records: POST /api/v1/salary-records/generate
2. Review records: GET /api/v1/salary-records?month=2026-03
3. Validate individual: POST /api/v1/salary-records/{id}/validate
4. Process all: POST /api/v1/salary-records/bulk-process
5. Export results: GET /api/v1/salary-records/export?month=2026-03
```

**2. Handle Processing Error:**

```
1. Check validation: POST /api/v1/salary-records/{id}/validate
2. Fix issue (e.g., wallet balance)
3. Retry processing: POST /api/v1/salary-records/{id}/process
```

**3. Correct Mistake:**

```
1. Reverse processed salary: POST /api/v1/salary-records/{id}/reverse
2. Regenerate corrected record
3. Re-process: POST /api/v1/salary-records/{id}/process
```

---

## 🔐 Authentication

All admin endpoints require Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

Tokens can be obtained via the `/api/auth/login` endpoint and refreshed using `/api/auth/refresh`.

---

- Adjust API base URL in `lib/utils.ts` or environment configuration as needed.
- This repo contains only frontend code; backend service should be developed separately.

---

Happy coding! 😊
