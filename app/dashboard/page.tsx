"use client";

import Link from "next/link";
import {
  Wallet,
  HandCoins,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { mockLoans, mockTransactions, mockEmployees } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEmployeeLoans } from "@/lib/client";

function getBadgeVariant(badge: string) {
  switch (badge) {
    case "Excellent":
      return "default" as const;
    case "Good":
      return "secondary" as const;
    case "Needs_improvement":
      return "outline" as const;
    case "Fair":
      return "outline" as const;
    default:
      return "destructive" as const;
  }
}

export default function EmployeeDashboard() {
  const { currentEmployee } = useAuth();
  if (!currentEmployee) return null;

  const { data } = useEmployeeLoans(0, 100);
  const loans = data?.data || [];

  // Find matching mock employee ID for filtering mock data
  // Mock employees use "emp-001" format, real API uses UUIDs and employee codes like "EMP003"
  const mockEmpId =
    mockEmployees.find((emp) => emp.employeeId === currentEmployee.employeeId)
      ?.id || currentEmployee.id;

  const myLoans = loans.filter((l) => l.employeeId === currentEmployee.id);
  const activeLoans = myLoans.filter(
    (l) => l.status === "approved" || l.status === "repaying",
  );
  const recentTxns = mockTransactions
    .filter(
      (t) => t.employeeId === currentEmployee.id || t.employeeId === mockEmpId,
    )
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {currentEmployee.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Here's an overview of your financial status."}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wallet Balance</p>
              <p className="text-2xl font-bold text-foreground">
                ${(currentEmployee?.walletBalance ?? 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent/15">
              <TrendingUp className="size-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Salary</p>
              <p className="text-2xl font-bold text-foreground">
                ${(currentEmployee?.salary ?? 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Loans</p>
              <p className="text-2xl font-bold text-foreground">
                $
                {activeLoans
                  .reduce((s, l) => s + l.remainingBalance, 0)
                  .toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Score</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {currentEmployee?.riskScore ?? 0}
                </p>
                <Badge
                  variant={getBadgeVariant(currentEmployee?.badge ?? "Fair")}
                >
                  {currentEmployee?.badge ?? "Fair"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Health</CardTitle>
            <CardDescription>
              Your overall financial wellness score
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Health Score
              </span>
              <span className="text-sm font-semibold text-foreground">
                {currentEmployee?.financialHealthScore ?? 0}/100
              </span>
            </div>
            <Progress
              value={currentEmployee?.financialHealthScore ?? 0}
              className="h-2.5"
            />

            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Attendance Rate</p>
                <p className="text-lg font-semibold text-foreground">
                  {currentEmployee?.attendanceRate ?? 0}%
                </p>
              </div>
              <div className="rounded-lg border bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Active Loans</p>
                <p className="text-lg font-semibold text-foreground">
                  {activeLoans.length}
                </p>
              </div>
            </div>

            <Button variant="outline" className="mt-2" asChild>
              <Link href="/dashboard/health">
                View Details <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentTxns.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-lg border bg-secondary/30 px-3 py-2.5"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {txn.description}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {txn.date}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${txn.amount > 0 ? "text-accent" : "text-destructive"}`}
                  >
                    {txn.amount > 0 ? "+" : ""}$
                    {Math.abs(txn.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/dashboard/transactions">View All Transactions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
            >
              <Link href="/dashboard/request">
                <HandCoins className="size-5 text-primary" />
                <span>Request Advance</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
            >
              <Link href="/dashboard/loans">
                <TrendingDown className="size-5 text-destructive" />
                <span>Loan History</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
            >
              <Link href="/dashboard/wallet">
                <Wallet className="size-5 text-accent" />
                <span>View Wallet</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
