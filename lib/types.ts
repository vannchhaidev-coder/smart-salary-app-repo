export type Role = "EMPLOYEE" | "ADMIN" | "USER";

export type LoanStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "repaying"
  | "completed";
export type RiskLevel = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department: string;
  position: string;
  joinDate: string | null;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  position: string;
  salary: number;
  walletBalance: number;
  financialHealthScore: number;
  attendanceRate: number;
  riskScore: number;
  badge: string;
}

export interface Admin extends User {
  role: "ADMIN";
}

export interface LoanRequest {
  uuid: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  amount: number;
  reason: string;
  requestDate: string;
  status: LoanStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  repaymentMonths: number;
  monthlyDeduction: number;
  remainingBalance: number;
  approvedDate?: string;
  approvedBy?: string;
}

export interface ApproveLoanResponse {
  message: string;
}

export interface Transaction {
  id: string;
  employeeId: string;
  type: "salary" | "advance" | "deduction" | "bonus";
  amount: number;
  date: string;
  description: string;
  balanceAfter: number;
}

export interface LoanTransaction {
  id: string;
  loanId: string;
  type: "credit" | "debit";
  amount: number;
  date: string;
  description: string;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  baseSalary: number;
  deductions: number;
  netSalary: number;
  month: string;
  status: "pending" | "processed";
  processedDate?: string | null;
}

export interface AnalyticsData {
  totalEmployees: number;
  totalLoansIssued: number;
  totalOutstanding: number;
  averageRiskScore: number;
  approvalRate: number;
  repaymentRate: number;
  monthlyLoanVolume: { month: string; amount: number; count: number }[];
  riskDistribution: { level: string; count: number }[];
  departmentLoans: { department: string; amount: number }[];
  recentActivity: { date: string; description: string; type: string }[];
}
