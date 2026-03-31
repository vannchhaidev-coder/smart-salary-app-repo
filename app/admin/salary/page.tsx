"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  DollarSign,
  CheckCircle2,
  Clock,
  Download,
  Filter,
} from "lucide-react";
import { mockLoans, mockSalaryRecords } from "@/lib/mock-data";
import {
  getSalaryRecords,
  processAllPendingSalaries,
  type SalaryRecordListResponse,
} from "@/lib/api/salary";
import type { SalaryRecord } from "@/lib/types";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function SalaryManagementPage() {
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        r.department.toLowerCase().includes(search.toLowerCase());
      const matchesDept = filterDept === "all" || r.department === filterDept;
      return matchesSearch && matchesDept;
    });
  }, [records, search, filterDept]);

  const departments = [...new Set(records.map((r) => r.department))];

  const loadSalaryRecords = useCallback(
    async (pageNumber = 0) => {
      setIsLoading(true);
      try {
        const response: SalaryRecordListResponse = await getSalaryRecords(
          pageNumber,
          size,
        );
        setRecords(response.data);
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
        setPage(response.pagination.page);
      } catch (error) {
        console.warn("Failed to load salary records", error);
        const start = pageNumber * size;
        const end = start + size;
        setRecords(mockSalaryRecords.slice(start, end));
        setTotal(mockSalaryRecords.length);
        setTotalPages(Math.ceil(mockSalaryRecords.length / size));
        setPage(pageNumber);
        toast.error("Could not load salary records; showing demo data.");
      } finally {
        setIsLoading(false);
      }
    },
    [size],
  );

  useEffect(() => {
    loadSalaryRecords(page);
  }, [loadSalaryRecords, page]);

  const totalBaseSalary = records.reduce((sum, r) => sum + r.baseSalary, 0);
  const totalDeductions = records.reduce((sum, r) => sum + r.deductions, 0);
  const totalNetSalary = records.reduce((sum, r) => sum + r.netSalary, 0);
  const pendingCount = records.filter((r) => r.status === "pending").length;
  const processedCount = records.filter((r) => r.status === "processed").length;

  function handleProcess(record: SalaryRecord) {
    setSelectedRecord(record);
    setConfirmOpen(true);
  }

  function confirmProcess() {
    if (!selectedRecord) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === selectedRecord.id ? { ...r, status: "processed" as const } : r,
      ),
    );
    setConfirmOpen(false);
    toast.success(
      `Salary for ${selectedRecord.employeeName} has been processed.`,
    );
  }

  async function handleProcessAll() {
    try {
      const result = await processAllPendingSalaries();
      // Refresh the records to show updated status
      await loadSalaryRecords(page);
      toast.success(result.message);
    } catch (error) {
      console.error("Failed to process all salaries", error);
      toast.error("Failed to process salaries. Please try again.");
    }
  }

  function exportToCSV() {
    const headers = [
      "Employee ID",
      "Employee Name",
      "Department",
      "Base Salary",
      "Deductions",
      "Net Salary",
      "Month",
      "Status",
      "Processed Date",
    ];

    const csvData = filtered.map((record) => [
      record.employeeId,
      record.employeeName,
      record.department,
      record.baseSalary,
      record.deductions,
      record.netSalary,
      record.month,
      record.status,
      (record as any).processedDate || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `salary-records-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported successfully!");
  }
  function getDeductionDetails(employeeId: string) {
    return mockLoans
      .filter(
        (l) =>
          l.employeeId === employeeId &&
          (l.status === "repaying" || l.status === "approved"),
      )
      .map((l) => ({
        loanId: l.uuid,
        reason: l.reason,
        monthlyDeduction: l.monthlyDeduction,
        remaining: l.remainingBalance,
      }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Salary Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Process monthly salaries and manage deductions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
          {pendingCount > 0 && (
            <Button size="sm" onClick={handleProcessAll}>
              <CheckCircle2 className="mr-2 size-4" />
              Process All ({pendingCount})
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Base Salary</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalBaseSalary.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
              <DollarSign className="size-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Deductions</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalDeductions.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-success/10">
              <DollarSign className="size-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Payable</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalNetSalary.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="size-4 text-warning-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-2xl font-bold text-foreground">
                {processedCount}/{records.length} processed
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
            placeholder="Search by name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Salary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monthly Payroll &mdash; {records[0]?.month || "March 2026"}
          </CardTitle>
          <CardDescription>{filtered.length} employees</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Base Salary</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((rec) => {
                const deductionDetails = getDeductionDetails(rec.employeeId);
                return (
                  <TableRow key={rec.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                          {rec.employeeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {rec.employeeName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rec.department}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-foreground">
                      ${rec.baseSalary.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {rec.deductions > 0 ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-sm font-medium text-destructive">
                            -${rec.deductions.toFixed(2)}
                          </span>
                          {deductionDetails.map((d) => (
                            <span
                              key={d.loanId}
                              className="text-[11px] text-muted-foreground"
                            >
                              {d.loanId}: -${d.monthlyDeduction.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          $0.00
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      ${rec.netSalary.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {rec.status === "processed" ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle2 className="mr-1 size-3" />
                          Processed
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-warning/40 bg-warning/10 text-warning-foreground"
                        >
                          <Clock className="mr-1 size-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {rec.status === "pending" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleProcess(rec)}
                        >
                          Process
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Done
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex flex-col gap-2 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(page * size + 1, total)}–
            {Math.min((page + 1) * size, total)} of {total} records
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
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle>Process Salary</DialogTitle>
                <DialogDescription>
                  Confirm salary processing for {selectedRecord.employeeName}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Base Salary</p>
                    <p className="text-lg font-bold text-foreground">
                      ${selectedRecord.baseSalary.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Deductions</p>
                    <p className="text-lg font-bold text-destructive">
                      -${selectedRecord.deductions.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                  <p className="text-xs text-muted-foreground">
                    Net Amount to Pay
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    ${selectedRecord.netSalary.toLocaleString()}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmProcess}>
                  <CheckCircle2 className="mr-2 size-4" />
                  Confirm Payment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
