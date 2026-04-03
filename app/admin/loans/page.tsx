"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Search,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { mockLoans, mockEmployees } from "@/lib/mock-data";
import {
  useLoans,
  useUpdateLoan,
  useApproveLoan,
  useRejectLoan,
  useEmployeeDebt,
  useLoanTransactions,
} from "@/lib/client";
import type { LoanRequest, LoanStatus } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

function getStatusBadge(status: LoanStatus) {
  const normalized = status.toLowerCase() as LoanStatus;
  switch (normalized) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-warning/40 bg-warning/10 text-warning-foreground"
        >
          <Clock className="mr-1 size-3" />
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="default" className="bg-primary text-primary-foreground">
          <CheckCircle2 className="mr-1 size-3" />
          Approved
        </Badge>
      );
    case "repaying":
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 size-3" />
          Repaying
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-success text-success-foreground">
          <CheckCircle2 className="mr-1 size-3" />
          Completed
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 size-3" />
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{normalized}</Badge>;
  }
}

function getRiskBadge(level: string, score: number) {
  const colors =
    level === "low"
      ? "bg-success/10 text-success border-success/30"
      : level === "medium"
        ? "bg-warning/10 text-warning-foreground border-warning/30"
        : "bg-destructive/10 text-destructive border-destructive/30";
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${colors}`}
    >
      {level === "high" && <AlertTriangle className="size-3" />}
      {score}
    </div>
  );
}

export default function LoanApprovalsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const { data: loanResponse, isLoading, error } = useLoans(page, size);
  const approveLoanMutation = useApproveLoan();
  const rejectLoanMutation = useRejectLoan();
  const loans = loanResponse?.data || [];
  const total = loanResponse?.pagination.total || 0;
  const totalPages = loanResponse?.pagination.totalPages || 1;

  console.log("Risk score loan:", loans);

  // Fallback to mock data if API fails
  const displayLoans = error
    ? mockLoans.slice(page * size, (page + 1) * size)
    : loans;
  const displayTotal = error ? mockLoans.length : total;
  const displayTotalPages = error
    ? Math.ceil(mockLoans.length / size)
    : totalPages;

  useEffect(() => {
    if (error) {
      toast.error("Failed to load loans from API; showing demo data.");
    }
  }, [error]);

  // Enrich loans with employee name and department from mockEmployees if not present
  const enrichedLoans = useMemo(() => {
    return displayLoans.map((loan) => {
      if (loan.employeeName && loan.department) {
        return loan;
      }
      const emp = mockEmployees.find((e) => e.id === loan.employeeId);
      return {
        ...loan,
        employeeName: loan.employeeName || emp?.name || "Unknown",
        department: loan.department || emp?.department || "Unknown",
      };
    });
  }, [displayLoans]);

  const filtered = useMemo(() => {
    return enrichedLoans.filter((loan) => {
      const matchesSearch =
        (loan.employeeName?.toLowerCase().includes(search.toLowerCase()) ??
          false) ||
        (loan.department?.toLowerCase().includes(search.toLowerCase()) ??
          false) ||
        loan.uuid.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || loan.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedLoans, search, filterStatus]);

  const pendingCount = enrichedLoans.filter(
    (l) => l.status === "pending",
  ).length;
  const approvedCount = enrichedLoans.filter(
    (l) =>
      l.status === "approved" ||
      l.status === "repaying" ||
      l.status === "completed",
  ).length;
  const rejectedCount = enrichedLoans.filter(
    (l) => l.status === "rejected",
  ).length;
  const totalOutstanding = enrichedLoans
    .filter((l) => l.status === "repaying" || l.status === "approved")
    .reduce((sum, l) => sum + l.remainingBalance, 0);

  const employeeDebtQuery = useEmployeeDebt(selectedLoan?.employeeId ?? "");
  const loanTransactionsQuery = useLoanTransactions(selectedLoan?.uuid ?? "");

  function handleApprove(loan: LoanRequest) {
    approveLoanMutation.mutate(loan.uuid, {
      onSuccess: () => {
        console.log("Approved Loan ID:", loan.uuid);
        setDetailOpen(false);
        toast.success(`Loan has been approved.`);
      },
      onError: () => {
        toast.error("Failed to approve loan");
      },
    });
  }

  function handleReject(loan: LoanRequest) {
    rejectLoanMutation.mutate(loan.uuid, {
      onSuccess: (updatedLoan) => {
        setDetailOpen(false);
        toast.success(`Loan has been rejected.`);
      },
      onError: () => {
        toast.error("Failed to reject loan");
      },
    });
  }

  function openDetail(loan: LoanRequest) {
    setSelectedLoan(loan);
    setDetailOpen(true);
  }

  const employee = selectedLoan
    ? mockEmployees.find((e) => e.id === selectedLoan.employeeId)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Loan Approvals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage employee salary advance requests
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="size-4 text-warning-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold text-foreground">
                {pendingCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle2 className="size-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-foreground">
                {approvedCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="size-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-foreground">
                {rejectedCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardCheck className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalOutstanding.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, department, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="repaying">Repaying</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loan Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Loan Requests</CardTitle>
          <CardDescription>{filtered.length} requests found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Repayment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((loan, index) => (
                <TableRow key={`${loan.uuid}-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                        {(loan.employeeName ?? "Unknown")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {loan.employeeName ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {loan.department ?? "Unknown"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-foreground">
                    ${loan.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getRiskBadge(loan.riskLevel, loan.riskScore)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {loan.repaymentMonths} months
                  </TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(loan.requestDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetail(loan)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex flex-col gap-2 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(page * size + 1, displayTotal)}–
            {Math.min((page + 1) * size, displayTotal)} of {displayTotal}{" "}
            requests
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(displayTotalPages - 1, p + 1))
              }
              disabled={page >= displayTotalPages - 1 || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Detail / Approve-Reject Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedLoan && (
            <>
              <DialogHeader>
                <DialogTitle>Loan Request</DialogTitle>
                <DialogDescription>
                  Review the details and take action on this request.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-2">
                {/* Employee Info */}
                <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {(selectedLoan.employeeName ?? "Unknown")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {selectedLoan.employeeName ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedLoan.department ?? "Unknown"} &middot;{" "}
                      {employee ? employee.position : "N/A"}
                    </p>
                  </div>
                  {getRiskBadge(selectedLoan.riskLevel, selectedLoan.riskScore)}
                </div>

                {/* Loan Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      Requested Amount
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      ${selectedLoan.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      Monthly Deduction
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      ${selectedLoan.monthlyDeduction.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      Repayment Period
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedLoan.repaymentMonths} months
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      Request Date
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {format(
                        new Date(selectedLoan.requestDate),
                        "MMM dd, yyyy",
                      )}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div className="rounded-lg border border-border p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Reason</p>
                  <p className="text-sm text-foreground">
                    {selectedLoan.reason}
                  </p>
                </div>

                {/* Risk Assessment */}
                {employee && (
                  <div className="rounded-lg border border-border p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Employee Risk Profile
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Financial Health
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={employee.financialHealthScore}
                            className="h-1.5 w-20"
                          />
                          <span className="text-xs font-medium text-foreground">
                            {employee.financialHealthScore}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Attendance Rate
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={employee.attendanceRate}
                            className="h-1.5 w-20"
                          />
                          <span className="text-xs font-medium text-foreground">
                            {employee.attendanceRate}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Salary
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          ${employee.salary.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status / Approval info */}
                {selectedLoan.approvedBy && (
                  <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                    <p className="text-xs text-muted-foreground">Approved by</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedLoan.approvedBy} on {selectedLoan.approvedDate}
                    </p>
                  </div>
                )}

                {/* Debt and transactions */}
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Employee Debt</p>
                  <p className="text-sm font-medium text-foreground">
                    {employeeDebtQuery.isFetching
                      ? "Loading..."
                      : `$${employeeDebtQuery.data?.toLocaleString() ?? "0.00"}`}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">
                    Loan Transactions
                  </p>
                  {loanTransactionsQuery.isLoading ? (
                    <p className="text-sm">Loading...</p>
                  ) : loanTransactionsQuery.data?.length ? (
                    <ul className="space-y-1">
                      {loanTransactionsQuery.data.map((txn) => (
                        <li key={txn.id} className="text-sm text-foreground">
                          {txn.date} • {txn.description} • {txn.type} • $
                          {txn.amount.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No transactions found.
                    </p>
                  )}
                </div>
              </div>

              {selectedLoan.status === "pending" && (
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedLoan)}
                  >
                    <XCircle className="mr-2 size-4" />
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(selectedLoan)}>
                    <CheckCircle2 className="mr-2 size-4" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
