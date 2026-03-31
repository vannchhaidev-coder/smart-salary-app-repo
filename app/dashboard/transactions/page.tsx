"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { mockTransactions, mockEmployees } from "@/lib/mock-data";
import { useEmployeeTransactions, useWalletTransactions } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

function typeBadge(type: string) {
  switch (type) {
    case "CREDIT":
      return (
        <Badge className="bg-accent/15 text-accent hover:bg-accent/20">
          Credit
        </Badge>
      );
    case "DEBIT":
      return <Badge variant="destructive">Debit</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

export default function TransactionsPage() {
  const { currentEmployee } = useAuth();
  if (!currentEmployee) return null;

  const mockEmpId =
    mockEmployees.find((emp) => emp.employeeId === currentEmployee.employeeId)
      ?.id || currentEmployee.id;

  const {
    data: employeeTransactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useEmployeeTransactions(currentEmployee.id);

  console.log("Employee Transactions: ", { data: employeeTransactions });

  useEffect(() => {
    if (transactionsError) {
      toast.error("Failed to load transactions from API; showing demo data.");
    }
  }, [transactionsError]);

  const apiTxns = employeeTransactions?.data?.map((t) => ({
    id: t.id,
    employeeId: t.employeeId,
    transactionId: t.id, // Use id as transactionId
    type: t.type,
    amount: t.type === "DEBIT" ? -t.amount : t.amount,
    description: t.description,
    date: t.date ? new Date(t.date).toLocaleDateString() : "",
    balanceAfter: t.balanceAfter,
  }));

  const myTxns =
    apiTxns && apiTxns.length > 0
      ? apiTxns
      : mockTransactions.filter(
          (t) =>
            t.employeeId === currentEmployee.id || t.employeeId === mockEmpId,
        );

  const income = myTxns
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const expenses = Math.abs(
    myTxns.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all your financial transactions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent/15">
              <ArrowDownLeft className="size-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-foreground">
                ${income.toLocaleString()}
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
              <p className="text-sm text-muted-foreground">Total Deductions</p>
              <p className="text-2xl font-bold text-foreground">
                ${expenses.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myTxns.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {txn.date}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    {txn.description}
                  </TableCell>
                  <TableCell>{typeBadge(txn.type)}</TableCell>
                  <TableCell
                    className={`text-right text-sm font-semibold ${txn.amount > 0 ? "text-accent" : "text-destructive"}`}
                  >
                    {txn.amount > 0 ? "+" : ""}$
                    {Math.abs(txn.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    ${txn.balanceAfter.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
