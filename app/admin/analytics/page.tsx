"use client";

import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useEffect } from "react";
import { mockAnalytics } from "@/lib/mock-data";
import { useAnalyticsSummary, useAnalyticsLoans } from "@/lib/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { toast } from "sonner";

const COLORS = [
  "oklch(0.55 0.18 250)",
  "oklch(0.68 0.16 165)",
  "oklch(0.65 0.20 45)",
  "oklch(0.75 0.12 200)",
  "oklch(0.60 0.15 300)",
  "oklch(0.75 0.15 70)",
];

export default function AnalyticsPage() {
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useAnalyticsSummary();
  const {
    data: loans,
    isLoading: loansLoading,
    error: loansError,
  } = useAnalyticsLoans();

  useEffect(() => {
    if (summaryError) {
      toast.error("Failed to load analytics summary; showing demo data.");
    }
  }, [summaryError]);

  useEffect(() => {
    if (loansError) {
      toast.error("Failed to load analytics loans; showing demo data.");
    }
  }, [loansError]);

  const data = {
    totalLoansIssued:
      summary?.totalLoansIssued ?? mockAnalytics.totalLoansIssued,
    totalOutstanding:
      summary?.totalOutstanding ?? mockAnalytics.totalOutstanding,
    approvalRate: summary?.approvalRate ?? mockAnalytics.approvalRate,
    repaymentRate: summary?.repaymentRate ?? mockAnalytics.repaymentRate,
    monthlyLoanVolume:
      loans?.monthlyLoanVolume ?? mockAnalytics.monthlyLoanVolume,
    riskDistribution: loans?.riskDistribution ?? mockAnalytics.riskDistribution,
    departmentLoans: loans?.departmentLoans ?? mockAnalytics.departmentLoans,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Financial analytics and reporting dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Loans</p>
              <p className="text-2xl font-bold text-foreground">
                {data.totalLoansIssued}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <DollarSign className="size-5 text-destructive" />
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
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent/15">
              <TrendingUp className="size-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approval Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {data.approvalRate}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <PieChartIcon className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Repayment Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {data.repaymentRate}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Loan Volume Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Loan Volume</CardTitle>
            <CardDescription>
              Amount and count of loans issued per month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyLoanVolume}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: "oklch(0.50 0.02 250)" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "oklch(0.50 0.02 250)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.90 0.01 240)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="oklch(0.55 0.18 250)"
                    radius={[4, 4, 0, 0]}
                    name="Amount ($)"
                  />
                  <Bar
                    dataKey="count"
                    fill="oklch(0.68 0.16 165)"
                    radius={[4, 4, 0, 0]}
                    name="Count"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Distribution</CardTitle>
            <CardDescription>Employee risk score categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="level"
                    label={({ level, count }) => `${count}`}
                  >
                    {data.riskDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.90 0.01 240)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Loans */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loans by Department</CardTitle>
            <CardDescription>Total loan amount per department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.departmentLoans} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    type="number"
                    className="text-xs"
                    tick={{ fill: "oklch(0.50 0.02 250)" }}
                  />
                  <YAxis
                    dataKey="department"
                    type="category"
                    width={90}
                    className="text-xs"
                    tick={{ fill: "oklch(0.50 0.02 250)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.90 0.01 240)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="oklch(0.55 0.18 250)"
                    radius={[0, 4, 4, 0]}
                    name="Amount ($)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Loan Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loan Trend</CardTitle>
            <CardDescription>Number of loan requests over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyLoanVolume}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: "oklch(0.50 0.02 250)" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "oklch(0.50 0.02 250)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.90 0.01 240)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="oklch(0.55 0.18 250)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Amount ($)"
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="oklch(0.68 0.16 165)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Count"
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
