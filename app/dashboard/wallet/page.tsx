"use client";

import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { mockTransactions, mockLoans, mockEmployees } from "@/lib/mock-data";
import {
  useEmployeeLoans,
  useWallet,
  useWalletTransactions,
} from "@/lib/client";
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
import { toast } from "sonner";

export default function WalletPage() {
  const { currentEmployee } = useAuth();
  console.log(currentEmployee);
  const employeeId = currentEmployee?.employeeId || "";
  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError,
  } = useWallet(employeeId);
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useWalletTransactions(wallet?.uuid || "");
  const { data: loanResponse, isLoading: loansLoading } = useEmployeeLoans(
    0,
    100,
  );
  const loans = loanResponse?.data || [];

  useEffect(() => {
    if (walletError) {
      toast.error("Failed to load wallet data; showing demo data.");
    }
  }, [walletError]);

  useEffect(() => {
    if (transactionsError) {
      toast.error("Failed to load transaction data; showing demo data.");
    }
  }, [transactionsError]);

  if (!currentEmployee) return null;

  // Find matching mock employee ID for filtering mock data
  const mockEmpId =
    mockEmployees.find((emp) => emp.employeeId === currentEmployee.employeeId)
      ?.id || currentEmployee.id;

  // Use API data if available, otherwise fall back to currentEmployee data
  const walletData = wallet || {
    employeeId: currentEmployee.employeeId,
    name: currentEmployee.name,
    department: currentEmployee.department,
    walletBalance: currentEmployee.walletBalance || 0,
    baseSalary: currentEmployee.salary || 0,
    deductions: 0,
    netSalary: currentEmployee.salary || 0,
  };

  const safeWalletData = {
    ...walletData,
    walletBalance: walletData.walletBalance ?? 0,
    baseSalary: walletData.baseSalary ?? 0,
    deductions: walletData.deductions ?? 0,
    netSalary: walletData.netSalary ?? 0,
  };

  // Use API transactions if available, otherwise fall back to mock data
  const transactionData =
    transactions ||
    mockTransactions
      .filter(
        (t) =>
          t.employeeId === currentEmployee.id || t.employeeId === mockEmpId,
      )
      .map((t) => ({
        transactionId: t.id,
        type: t.type.toUpperCase(),
        amount: t.amount,
        description: t.description,
        transactionDate: t.date,
      }));

  const activeLoans = loans.filter(
    (l) => l.status === "approved" || l.status === "repaying",
  );
  const totalDeductions = activeLoans.reduce(
    (s, l) => s + l.monthlyDeduction,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Wallet
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account balance and transactions overview
        </p>
        {(walletLoading || transactionsLoading) && (
          <p className="mt-2 text-sm text-muted-foreground">
            Loading wallet data…
          </p>
        )}
      </div>

      {/* Wallet Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700 text-white shadow-2xl border-0">
        <CardContent className="relative p-6">
          <div className="absolute right-4 top-4 opacity-20">
            <CreditCard className="size-20" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-white/70">Available Balance</p>
            <p className="text-6xl font-bold">
              ${safeWalletData.walletBalance.toLocaleString()}
            </p>
          </div>
          <div className="mt-6 flex gap-8">
            <div>
              <p className="text-xs text-white/70">Monthly Salary</p>
              <p className="text-lg font-semibold text-white">
                ${safeWalletData.baseSalary.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/70">Monthly Deductions</p>
              <p className="text-lg font-semibold text-white">
                ${totalDeductions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/70">Net Monthly</p>
              <p className="text-lg font-semibold text-white">
                ${safeWalletData.netSalary.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Wallet className="size-4 text-white/70" />
            <span className="text-xs text-white/70">
              {safeWalletData.name} - {safeWalletData.department}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent/15">
              <ArrowDownLeft className="size-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Received</p>
              <p className="text-xl font-bold text-foreground">
                $
                {transactionData
                  .filter((t) => t.type === "CREDIT")
                  .reduce((s, t) => s + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <ArrowUpRight className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-xl font-bold text-foreground">
                $
                {transactionData
                  .filter((t) => t.type === "DEBIT")
                  .reduce((s, t) => s + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Loans</p>
              <p className="text-xl font-bold text-foreground">
                {activeLoans.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Loans */}
      {activeLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Loans</CardTitle>
            <CardDescription>
              Loans currently being repaid from your salary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {activeLoans.map((loan) => (
                <div
                  key={loan.uuid}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {loan.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Monthly deduction: $
                      {loan.monthlyDeduction.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${loan.remainingBalance.toLocaleString()}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      remaining
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionData.map((txn) => (
                <TableRow key={txn.transactionId}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(txn.transactionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">{txn.description}</TableCell>
                  <TableCell>
                    <Badge variant={txn.type === "CREDIT" ? "default" : txn.type === "DEBIT" ? "destructive" : "secondary"}>
                      {txn.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right text-sm font-semibold ${txn.type === "CREDIT" ? "text-accent" : "text-destructive"}`}>
                    {txn.type === "CREDIT" ? "+" : "-"}${txn.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}
    </div>
  );
}
