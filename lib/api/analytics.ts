import { z } from "zod";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function buildUrl(path: string) {
  if (BASE_URL) {
    return `${BASE_URL.replace(/\/$/, "")}${path}`;
  }
  return path;
}

function getAuthHeaders() {
  const token = Cookies.get("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    return res.text().then((text) => {
      const message = text || res.statusText;
      throw new Error(`API request failed: ${message}`);
    });
  }
  return res.json() as Promise<T>;
}

// Schemas
const analyticsSummarySchema = z.object({
  totalLoansIssued: z.number(),
  totalOutstanding: z.number(),
  approvalRate: z.number(),
  repaymentRate: z.number(),
});

const monthlyLoanVolumeSchema = z.object({
  month: z.string(),
  amount: z.number(),
  count: z.number(),
});

const riskDistributionSchema = z.object({
  level: z.string(),
  count: z.number(),
});

const departmentLoansSchema = z.object({
  department: z.string(),
  amount: z.number(),
});

const analyticsLoansSchema = z.object({
  monthlyLoanVolume: z.array(monthlyLoanVolumeSchema),
  riskDistribution: z.array(riskDistributionSchema),
  departmentLoans: z.array(departmentLoansSchema),
});

export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>;
export type AnalyticsLoans = z.infer<typeof analyticsLoansSchema>;

// API Functions
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const res = await fetch(buildUrl(`/api/v1/analytics/summary`), {
    method: "GET",
    headers,
  });
  console.log("get summary: ", res);

  const data = await handleResponse<AnalyticsSummary>(res);
  return analyticsSummarySchema.parse(data);
}

export async function getAnalyticsLoans(): Promise<AnalyticsLoans> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const res = await fetch(buildUrl(`/api/v1/analytics/loans`), {
    method: "GET",
    headers,
  });

  const data = await handleResponse<AnalyticsLoans>(res);
  return analyticsLoansSchema.parse(data);
}
