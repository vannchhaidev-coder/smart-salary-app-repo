import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const loanRequestSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required" })
    .min(100, "Minimum advance amount is $100")
    .max(5000, "Maximum advance amount is $5,000"),
  reason: z
    .string()
    .min(10, "Please provide a detailed reason (at least 10 characters)")
    .max(500, "Reason must be under 500 characters"),
  repaymentMonths: z
    .number({ required_error: "Repayment period is required" })
    .min(1, "Minimum 1 month")
    .max(12, "Maximum 12 months"),
});
export type LoanRequestFormValues = z.infer<typeof loanRequestSchema>;

export const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  salary: z
    .number({ required_error: "Salary is required" })
    .min(500, "Minimum salary is $500"),
});
export type EmployeeFormValues = z.infer<typeof employeeSchema>;
