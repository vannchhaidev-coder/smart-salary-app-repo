# Smart Salary App API Endpoints Draft

This document outlines all the API endpoints needed for the complete Smart Salary Management System.

## Authentication Endpoints

### POST /api/auth/login

**Login user**

```json
// Request
{
  "email": "admin@company.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "usr-001",
      "name": "Admin User",
      "email": "admin@company.com",
      "role": "ADMIN"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

### POST /api/auth/logout

**Logout user**

```json
// Request
{
  "refreshToken": "eyJ..."
}

// Response
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me

**Get current user info**

```json
// Response
{
  "success": true,
  "data": {
    "id": "usr-001",
    "name": "Admin User",
    "email": "admin@company.com",
    "role": "ADMIN",
    "department": "IT"
  }
}
```

### POST /api/auth/refresh

**Refresh access token**

```json
// Request
{
  "refreshToken": "eyJ..."
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

## Admin Endpoints

### Employees Management

#### GET /api/admin/employees

**List employees with pagination and filtering**

```json
// Query params: ?page=0&size=10&department=Engineering&search=john
// Response
{
  "success": true,
  "data": [
    {
      "id": "emp-001",
      "employeeId": "EMP001",
      "name": "John Doe",
      "email": "john@company.com",
      "department": "Engineering",
      "position": "Senior Developer",
      "salary": 5000,
      "walletBalance": 2500,
      "financialHealthScore": 85,
      "attendanceRate": 95,
      "riskScore": 15,
      "badge": "Excellent",
      "joinDate": "2023-01-15"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### POST /api/admin/employees

**Create new employee**

```json
// Request
{
  "employeeId": "EMP051",
  "name": "Jane Smith",
  "email": "jane@company.com",
  "department": "Marketing",
  "position": "Marketing Manager",
  "salary": 4500
}

// Response
{
  "success": true,
  "data": {
    "id": "emp-051",
    "employeeId": "EMP051",
    "name": "Jane Smith",
    "email": "jane@company.com",
    "department": "Marketing",
    "position": "Marketing Manager",
    "salary": 4500,
    "walletBalance": 0,
    "financialHealthScore": 100,
    "attendanceRate": 100,
    "riskScore": 0,
    "badge": "New",
    "joinDate": "2024-03-29"
  }
}
```

#### GET /api/admin/employees/{id}

**Get employee details**

```json
// Response
{
  "success": true,
  "data": {
    "id": "emp-001",
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john@company.com",
    "department": "Engineering",
    "position": "Senior Developer",
    "salary": 5000,
    "walletBalance": 2500,
    "financialHealthScore": 85,
    "attendanceRate": 95,
    "riskScore": 15,
    "badge": "Excellent",
    "joinDate": "2023-01-15",
    "loans": [
      {
        "id": "loan-001",
        "amount": 1000,
        "status": "repaying",
        "remainingBalance": 600
      }
    ]
  }
}
```

#### PUT /api/admin/employees/{id}

**Update employee**

```json
// Request
{
  "name": "John Smith",
  "department": "Engineering",
  "position": "Lead Developer",
  "salary": 5500
}

// Response
{
  "success": true,
  "data": { /* updated employee object */ }
}
```

#### DELETE /api/admin/employees/{id}

**Delete employee**

```json
// Response
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

### Salary Management

#### GET /api/admin/salary

**List salary records**

```json
// Query params: ?page=0&size=10&month=2024-03&status=pending&employeeId=emp-001
// Response
{
  "success": true,
  "data": [
    {
      "id": "sal-rec-001",
      "employeeId": "emp-001",
      "employeeName": "John Doe",
      "department": "Engineering",
      "baseSalary": 5000,
      "deductions": 500,
      "netSalary": 4500,
      "month": "2024-03",
      "status": "pending",
      "processedDate": null
    }
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### POST /api/admin/salary

**Create salary record**

```json
// Request
{
  "employeeId": "emp-001",
  "baseSalary": 5000,
  "deductions": 500,
  "month": "2024-03"
}

// Response
{
  "success": true,
  "data": {
    "id": "sal-rec-001",
    "employeeId": "emp-001",
    "employeeName": "John Doe",
    "department": "Engineering",
    "baseSalary": 5000,
    "deductions": 500,
    "netSalary": 4500,
    "month": "2024-03",
    "status": "pending"
  }
}
```

#### PUT /api/admin/salary

**Update salary record status**

```json
// Request
{
  "id": "sal-rec-001",
  "status": "processed"
}

// Response
{
  "success": true,
  "data": { /* updated salary record */ }
}
```

#### POST /api/admin/salary/process-all

**Process all pending salaries**

```json
// Request: (empty body)
// Response
{
  "success": true,
  "message": "Successfully processed 25 salary records",
  "data": {
    "processed": 25,
    "totalAmount": 112500
  }
}
```

#### GET /api/admin/salary/{id}

**Get specific salary record**

```json
// Response
{
  "success": true,
  "data": {
    "id": "sal-rec-001",
    "employeeId": "emp-001",
    "employeeName": "John Doe",
    "department": "Engineering",
    "baseSalary": 5000,
    "deductions": 500,
    "netSalary": 4500,
    "month": "2024-03",
    "status": "processed",
    "processedDate": "2024-03-29T10:00:00Z",
    "deductionBreakdown": [
      {
        "type": "loan",
        "loanId": "loan-001",
        "amount": 300,
        "description": "Monthly loan repayment"
      },
      {
        "type": "tax",
        "amount": 200,
        "description": "Income tax deduction"
      }
    ]
  }
}
```

#### PUT /api/admin/salary/{id}

**Update specific salary record**

```json
// Request
{
  "baseSalary": 5200,
  "deductions": 520
}

// Response
{
  "success": true,
  "data": { /* updated salary record */ }
}
```

#### DELETE /api/admin/salary/{id}

**Delete salary record**

```json
// Response
{
  "success": true,
  "message": "Salary record deleted successfully"
}
```

### Loan Management

#### GET /api/admin/loans

**List loan requests**

```json
// Query params: ?page=0&size=10&status=pending&employeeId=emp-001
// Response
{
  "success": true,
  "data": [
    {
      "id": "loan-001",
      "employeeId": "emp-001",
      "employeeName": "John Doe",
      "department": "Engineering",
      "amount": 2000,
      "reason": "Medical emergency",
      "requestDate": "2024-03-15",
      "status": "pending",
      "riskScore": 25,
      "riskLevel": "medium",
      "repaymentMonths": 12,
      "monthlyDeduction": 200,
      "remainingBalance": 2000
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

#### POST /api/admin/loans

**Create loan request (admin)**

```json
// Request
{
  "employeeId": "emp-001",
  "amount": 2000,
  "reason": "Medical emergency",
  "repaymentMonths": 12
}

// Response
{
  "success": true,
  "data": { /* created loan object */ }
}
```

#### GET /api/admin/loans/{id}

**Get loan details**

```json
// Response
{
  "success": true,
  "data": {
    "id": "loan-001",
    "employeeId": "emp-001",
    "employeeName": "John Doe",
    "amount": 2000,
    "reason": "Medical emergency",
    "requestDate": "2024-03-15",
    "status": "approved",
    "approvedDate": "2024-03-16",
    "approvedBy": "Admin User",
    "riskScore": 25,
    "riskLevel": "medium",
    "repaymentMonths": 12,
    "monthlyDeduction": 200,
    "remainingBalance": 1600,
    "transactions": [
      {
        "id": "txn-001",
        "type": "debit",
        "amount": 200,
        "date": "2024-03-29",
        "description": "Monthly loan repayment"
      }
    ]
  }
}
```

#### PUT /api/admin/loans/{id}

**Update loan**

```json
// Request
{
  "status": "approved",
  "repaymentMonths": 10
}

// Response
{
  "success": true,
  "data": { /* updated loan object */ }
}
```

#### POST /api/admin/loans/{id}/approve

**Approve loan**

```json
// Request
{
  "repaymentMonths": 12
}

// Response
{
  "success": true,
  "data": { /* approved loan object */ }
}
```

#### POST /api/admin/loans/{id}/reject

**Reject loan**

```json
// Request
{
  "reason": "Risk score too high"
}

// Response
{
  "success": true,
  "data": { /* rejected loan object */ }
}
```

### Analytics

#### GET /api/admin/analytics

**Get dashboard analytics**

```json
// Response
{
  "success": true,
  "data": {
    "totalEmployees": 50,
    "totalLoansIssued": 25,
    "totalOutstanding": 45000,
    "averageRiskScore": 35,
    "approvalRate": 75,
    "repaymentRate": 85,
    "monthlyLoanVolume": [
      { "month": "2024-01", "amount": 15000, "count": 8 },
      { "month": "2024-02", "amount": 22000, "count": 12 },
      { "month": "2024-03", "amount": 18000, "count": 10 }
    ],
    "riskDistribution": [
      { "level": "low", "count": 15 },
      { "level": "medium", "count": 25 },
      { "level": "high", "count": 10 }
    ],
    "departmentLoans": [
      { "department": "Engineering", "amount": 25000 },
      { "department": "Marketing", "amount": 15000 },
      { "department": "HR", "amount": 5000 }
    ],
    "recentActivity": [
      {
        "date": "2024-03-29",
        "description": "John Doe requested a loan of $2000",
        "type": "loan_request"
      },
      {
        "date": "2024-03-28",
        "description": "Salary processed for 25 employees",
        "type": "salary_processed"
      }
    ]
  }
}
```

#### GET /api/admin/analytics/salary-trends

**Get salary trends**

```json
// Query params: ?months=12
// Response
{
  "success": true,
  "data": {
    "totalSalaryPaid": 250000,
    "averageSalary": 4800,
    "salaryTrends": [
      { "month": "2024-01", "totalPaid": 20000, "employeeCount": 45 },
      { "month": "2024-02", "totalPaid": 21000, "employeeCount": 46 },
      { "month": "2024-03", "totalPaid": 22000, "employeeCount": 50 }
    ]
  }
}
```

#### GET /api/admin/analytics/loan-stats

**Get loan statistics**

```json
// Response
{
  "success": true,
  "data": {
    "totalLoans": 25,
    "approvedLoans": 20,
    "rejectedLoans": 5,
    "pendingLoans": 3,
    "totalAmountIssued": 50000,
    "totalOutstanding": 25000,
    "averageLoanAmount": 2000,
    "repaymentRate": 85
  }
}
```

## Employee Dashboard Endpoints

### GET /api/dashboard/profile

**Get employee profile**

```json
// Response
{
  "success": true,
  "data": {
    "id": "emp-001",
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john@company.com",
    "department": "Engineering",
    "position": "Senior Developer",
    "salary": 5000,
    "walletBalance": 2500,
    "financialHealthScore": 85,
    "attendanceRate": 95,
    "riskScore": 15,
    "badge": "Excellent",
    "joinDate": "2023-01-15"
  }
}
```

### GET /api/dashboard/salary

**Get employee's salary information**

```json
// Response
{
  "success": true,
  "data": {
    "currentSalary": {
      "baseSalary": 5000,
      "deductions": 500,
      "netSalary": 4500,
      "month": "2024-03",
      "status": "processed"
    },
    "salaryHistory": [
      {
        "month": "2024-02",
        "baseSalary": 5000,
        "deductions": 500,
        "netSalary": 4500,
        "status": "processed"
      },
      {
        "month": "2024-01",
        "baseSalary": 4800,
        "deductions": 480,
        "netSalary": 4320,
        "status": "processed"
      }
    ]
  }
}
```

### GET /api/dashboard/loans

**Get employee's loans**

```json
// Response
{
  "success": true,
  "data": [
    {
      "id": "loan-001",
      "amount": 2000,
      "reason": "Medical emergency",
      "requestDate": "2024-03-15",
      "status": "repaying",
      "remainingBalance": 1600,
      "monthlyDeduction": 200,
      "nextPaymentDate": "2024-04-29"
    }
  ]
}
```

### POST /api/dashboard/loans

**Request new loan**

```json
// Request
{
  "amount": 1500,
  "reason": "Home renovation",
  "repaymentMonths": 8
}

// Response
{
  "success": true,
  "data": { /* created loan request */ }
}
```

### GET /api/dashboard/transactions

**Get employee's transactions**

```json
// Query params: ?page=0&size=10&type=salary
// Response
{
  "success": true,
  "data": [
    {
      "id": "txn-001",
      "type": "salary",
      "amount": 4500,
      "date": "2024-03-29",
      "description": "Monthly salary payment",
      "balanceAfter": 4500
    },
    {
      "id": "txn-002",
      "type": "deduction",
      "amount": -200,
      "date": "2024-03-29",
      "description": "Loan repayment",
      "balanceAfter": 4300
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

### GET /api/dashboard/wallet

**Get wallet information**

```json
// Response
{
  "success": true,
  "data": {
    "balance": 2500,
    "availableBalance": 2300,
    "pendingDeductions": 200,
    "transactions": [
      {
        "id": "txn-001",
        "type": "credit",
        "amount": 4500,
        "date": "2024-03-29",
        "description": "Salary deposit"
      }
    ]
  }
}
```

## Common Response Format

All endpoints follow this standard response format:

**Success Response:**

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Optional success message"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      /* validation errors */
    }
  }
}
```

## Authentication

All admin endpoints require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

Employee dashboard endpoints also require authentication but may have different permissions.

## Pagination

List endpoints support pagination with these query parameters:

- `page`: Page number (0-based, default: 0)
- `size`: Page size (default: 10, max: 100)

## Filtering & Search

Most list endpoints support filtering:

- `search`: General search across relevant fields
- `status`: Filter by status
- `department`: Filter by department
- `employeeId`: Filter by employee ID
- `month`: Filter by month (YYYY-MM format)
- `dateFrom`/`dateTo`: Date range filters

## Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., duplicate)
- `INTERNAL_ERROR`: Server error
