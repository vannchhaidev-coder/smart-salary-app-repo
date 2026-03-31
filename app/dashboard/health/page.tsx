"use client";

import {
  HeartPulse,
  TrendingUp,
  Calendar,
  ShieldCheck,
  Banknote,
  Award,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { mockLoans, mockEmployees } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEmployeeLoans } from "@/lib/client";

function getBadgeColor(badge: string) {
  const badgeUpper = badge?.toUpperCase() || "";
  switch (badgeUpper) {
    case "EXCELLENT":
      return "bg-accent/15 text-accent border-accent/30";
    case "GOOD":
      return "bg-primary/10 text-primary border-primary/30";
    case "NEEDS_IMPROVEMENT":
      return "bg-warning/15 text-warning border-warning/30";
    case "FAIR":
      return "bg-warning/10 text-warning-foreground border-warning/30";
    default:
      return "bg-destructive/10 text-destructive border-destructive/30";
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-accent";
  if (score >= 50) return "text-primary";
  return "text-destructive";
}

export default function FinancialHealthPage() {
  const { currentEmployee } = useAuth();
  const { data, isLoading, error } = useEmployeeLoans(0, 100);
  if (!currentEmployee) return null;

  const loans = data?.data || [];

  const myLoans = loans.filter((l) => l.employeeId === currentEmployee.id);

  const completedLoans = myLoans.filter((l) => l.status === "completed");

  const activeLoans = myLoans.filter(
    (l) => l.status === "pending" || l.status === "approved",
  );

  const salaryScore =
    currentEmployee.salary >= 1500
      ? 90
      : currentEmployee.salary >= 1000
        ? 80
        : currentEmployee.salary >= 500
          ? 70
          : 60;

  const criteria = [
    {
      label: "Attendance Rate",
      weight: "40%",
      value: currentEmployee.attendanceRate,
      icon: Calendar,
      description: "Your monthly attendance and punctuality",
    },
    {
      label: "Repayment History",
      weight: "30%",
      value: completedLoans.length > 0 ? 90 : 70,
      icon: TrendingUp,
      description: "On-time repayment track record",
    },
    {
      label: "Salary Stability",
      weight: "20%",
      value: salaryScore,
      icon: Banknote,
      description: "Consistency of salary over time",
    },
    {
      label: "Existing Debt Ratio",
      weight: "10%",
      value: activeLoans.length === 0 ? 95 : activeLoans.length === 1 ? 70 : 40,
      icon: ShieldCheck,
      description: "Current debt relative to salary",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Financial Health
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your financial wellness score and breakdown
        </p>
      </div>

      {/* Main Score Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col items-center gap-4 bg-secondary/50 p-8 md:flex-row md:gap-8">
            <div className="relative flex size-32 items-center justify-center rounded-full border-4 border-primary/20">
              <div className="flex flex-col items-center">
                <span
                  className={`text-4xl font-bold ${getScoreColor(currentEmployee.financialHealthScore)}`}
                >
                  {currentEmployee.financialHealthScore}
                </span>
                <span className="text-xs text-muted-foreground">
                  out of 100
                </span>
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center gap-3 md:justify-start">
                <h2 className="text-xl font-bold text-foreground">
                  Financial Health Score
                </h2>
                <Badge
                  variant="outline"
                  className={getBadgeColor(currentEmployee.badge)}
                >
                  <Award className="mr-1 size-3" />
                  {currentEmployee.badge}
                </Badge>
              </div>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Your financial health score is calculated based on your
                attendance, repayment history, salary stability, and existing
                debt. A higher score means better loan terms and faster
                approvals.
              </p>
              <div className="mt-3">
                <Progress
                  value={currentEmployee.financialHealthScore}
                  className="h-2.5 w-64"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Score */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Score</p>
              <p
                className={`text-2xl font-bold ${getScoreColor(currentEmployee.riskScore)}`}
              >
                {currentEmployee.riskScore}
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
              <p className="text-sm text-muted-foreground">Loans Completed</p>
              <p className="text-2xl font-bold text-foreground">
                {completedLoans.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <Banknote className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Loans</p>
              <p className="text-2xl font-bold text-foreground">
                {activeLoans.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Criteria Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HeartPulse className="size-4 text-primary" />
            Score Criteria Breakdown
          </CardTitle>
          <CardDescription>How your risk score is calculated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5">
            {criteria.map((c) => (
              <div
                key={c.label}
                className="flex flex-col gap-2 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-secondary">
                      <c.icon className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {c.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold ${getScoreColor(c.value)}`}
                    >
                      {c.value}%
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Weight: {c.weight}
                    </p>
                  </div>
                </div>
                <Progress value={c.value} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approval Rules</CardTitle>
          <CardDescription>
            How your risk score affects loan approvals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <p className="text-sm font-semibold text-accent">
                80 - 100: Auto Approved
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your advance is automatically approved without admin review
              </p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">
                50 - 79: Admin Review
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your request is sent to an admin for manual review
              </p>
            </div>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-semibold text-destructive">
                {"Below 50: Rejected"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your request will likely be rejected due to high risk
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
