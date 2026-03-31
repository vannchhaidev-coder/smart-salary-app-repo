"use client";

import React from "react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { mockLoans, mockEmployees } from "@/lib/mock-data";
import { useEmployeeLoans } from "@/lib/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function statusBadge(status: string) {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "approved":
      return (
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
          Approved
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-warning/10 text-warning-foreground hover:bg-warning/20">
          Pending
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "repaying":
      return (
        <Badge className="bg-accent/15 text-accent hover:bg-accent/20">
          Repaying
        </Badge>
      );
    case "completed":
      return <Badge variant="secondary">Completed</Badge>;
    default:
      return <Badge variant="outline">{normalized}</Badge>;
  }
}

function riskBadge(level: string) {
  switch (level) {
    case "low":
      return (
        <Badge variant="outline" className="text-accent border-accent/30">
          Low
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="outline" className="text-primary border-primary/30">
          Medium
        </Badge>
      );
    case "high":
      return (
        <Badge
          variant="outline"
          className="text-destructive border-destructive/30"
        >
          High
        </Badge>
      );
    default:
      return <Badge variant="outline">{level}</Badge>;
  }
}

export default function LoanHistoryPage() {
  const { currentEmployee } = useAuth();
  if (!currentEmployee) return null;

  const { data: loanResponse, isLoading, error } = useEmployeeLoans(0, 100); // Get all loans for the employee
  const loans = loanResponse?.data || [];

  // Fallback to mock data if API fails
  const displayLoans = error
    ? mockLoans.filter((l) => l.employeeId === currentEmployee.id)
    : loans;
  console.log(displayLoans);

  // Show error toast if API fails
  React.useEffect(() => {
    if (error) {
      toast.error("Failed to load loan history from API; showing demo data.");
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Loan History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all your salary advance requests and their status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Requests</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                {displayLoans.length}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Approved</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-accent">
                {
                  displayLoans.filter(
                    (l) =>
                      l.status === "approved" ||
                      l.status === "repaying" ||
                      l.status === "completed",
                  ).length
                }
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-primary">
                {displayLoans.filter((l) => l.status === "pending").length}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rejected</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-destructive">
                {displayLoans.filter((l) => l.status === "rejected").length}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loan Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Loan Requests</CardTitle>
          <CardDescription>
            Complete history of your salary advance requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : displayLoans.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No loan requests yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Monthly Deduction</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayLoans.map((loan) => (
                  <TableRow key={loan.uuid}>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(loan.requestDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">
                      ${loan.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-foreground">
                      {loan.reason}
                    </TableCell>
                    <TableCell>{riskBadge(loan.riskLevel)}</TableCell>
                    <TableCell>{statusBadge(loan.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      ${loan.monthlyDeduction.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      ${loan.remainingBalance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
