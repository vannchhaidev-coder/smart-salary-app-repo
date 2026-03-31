"use client";

import {
  Users,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  useAnalyticsSummary,
  useAnalyticsLoans,
  useLoans,
  useEmployees,
} from "@/lib/client";
import { mockEmployees } from "@/lib/mock-data";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminDashboard() {
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useAnalyticsSummary();
  const {
    data: loansData,
    isLoading: loansLoading,
    error: loansError,
  } = useAnalyticsLoans();
  const {
    data: loansResponse,
    isLoading: loansListLoading,
    error: loansListError,
  } = useLoans(0, 50); // Get more loans for pending list
  const {
    data: employeesResponse,
    isLoading: employeesLoading,
    error: employeesError,
  } = useEmployees(0, 1000); // Get all employees for count and risk score

  // Handle errors (only show for critical failures, not when falling back to mock data)
  if (summaryError) {
    toast.error("Failed to load analytics summary");
  }
  if (loansError) {
    toast.error("Failed to load analytics loans data");
  }
  if (loansListError) {
    toast.error("Failed to load loans list");
  }

  const employees = employeesResponse?.data?.length
    ? employeesResponse.data
    : employeesError
      ? mockEmployees
      : mockEmployees;
  const totalEmployees = employees.length;
  const averageRiskScore =
    employees.length > 0
      ? Math.round(
          employees.reduce((sum, emp) => sum + (emp.riskScore ?? 0), 0) /
            employees.length,
        )
      : 0;

  const recentActivity =
    loansResponse?.data
      .sort(
        (a, b) =>
          new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime(),
      )
      .slice(0, 10) // last 10 events
      .map((loan) => ({
        date: new Date(loan.requestDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        description: `${loan.employeeName ?? "Unknown"} ${loan.status === "approved" ? "was approved for" : loan.status === "rejected" ? "was rejected for" : "requested"} $${loan.amount.toLocaleString()}`,
        type: loan.status,
      })) ?? [];

  const data =
    summaryData && loansData
      ? {
          ...summaryData,
          totalEmployees,
          averageRiskScore,
          monthlyLoanVolume: loansData.monthlyLoanVolume,
          riskDistribution: loansData.riskDistribution,
          departmentLoans: loansData.departmentLoans,
          recentActivity: recentActivity,
        }
      : null;

  const pendingLoans =
    loansResponse?.data.filter((l) => l.status === "pending") ?? [];

  const getInitials = (name?: string) => {
    return (name ?? "?")
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const isLoading =
    summaryLoading || loansLoading || loansListLoading || employeesLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-1 h-4 w-96" />
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-5">
                <Skeleton className="size-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your organization financial management
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              Failed to load dashboard data. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your organization financial management
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold text-foreground">
                {data.totalEmployees}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent/15">
              <DollarSign className="size-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Loans Issued</p>
              <p className="text-2xl font-bold text-foreground">
                {data.totalLoansIssued}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingUp className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-foreground">
                ${data.totalOutstanding.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldAlert className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Risk Score</p>
              <p className="text-2xl font-bold text-foreground">
                {data.averageRiskScore}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rate Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Metrics</CardTitle>
            <CardDescription>Approval and repayment rates</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Approval Rate</span>
                <span className="font-semibold text-foreground">
                  {data.approvalRate}%
                </span>
              </div>
              <Progress value={data.approvalRate} className="h-2.5" />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Repayment Rate</span>
                <span className="font-semibold text-foreground">
                  {data.repaymentRate}%
                </span>
              </div>
              <Progress value={data.repaymentRate} className="h-2.5" />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {data.riskDistribution.map((r, index) => (
                <div
                  key={`${r.level}-${index}`}
                  className="rounded-lg border bg-secondary/50 p-3 text-center"
                >
                  <p className="text-lg font-bold text-foreground">{r.count}</p>
                  <p className="text-xs text-muted-foreground">{r.level}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Pending Approvals</CardTitle>
                <CardDescription>
                  {pendingLoans.length} requests awaiting review
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {pendingLoans.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {pendingLoans.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No pending approvals.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingLoans.map((loan, index) => (
                  <div
                    key={`${loan.uuid}-${index}`}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                        {getInitials(loan.employeeName)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {loan.employeeName ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {loan.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        ${loan.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Score: {loan.riskScore}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/admin/loans">
                View All Loans <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Latest events across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No recent activity available.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.recentActivity.map((item, i) => (
                <div
                  key={`${item.date}-${i}`}
                  className="flex items-center gap-3 rounded-lg border bg-secondary/30 px-4 py-3"
                >
                  <Clock className="size-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Button
          asChild
          variant="outline"
          className="h-auto flex-col gap-2 py-6"
        >
          <Link href="/admin/employees">
            <Users className="size-5 text-primary" />
            <span>Manage Employees</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto flex-col gap-2 py-6"
        >
          <Link href="/admin/loans">
            <ShieldAlert className="size-5 text-destructive" />
            <span>Review Loans</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto flex-col gap-2 py-6"
        >
          <Link href="/admin/analytics">
            <TrendingUp className="size-5 text-accent" />
            <span>View Analytics</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
