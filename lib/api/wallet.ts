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
const walletInfoSchema = z.object({
  uuid: z.string(),
  employeeId: z.string(),
  name: z.string(),
  department: z.string(),
  walletBalance: z.number(),
  baseSalary: z.number(),
  deductions: z.number(),
  netSalary: z.number(),
});

const walletBalanceSchema = z.object({
  employeeId: z.string(),
  walletBalance: z.number(),
  currency: z.string(),
});

const walletTransactionSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().optional(),
  transactionId: z.string(),
  type: z.string(),
  amount: z.number(),
  description: z.string(),
  transactionDate: z.string(),
});

const employeeTransactionSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  type: z.string(),
  amount: z.number(),
  date: z.string(),
  description: z.string(),
  balanceAfter: z.number(),
});

const employeeTransactionsResponseSchema = z.object({
  data: z.array(employeeTransactionSchema),
  pagination: z.object({
    page: z.number(),
    size: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type WalletInfo = z.infer<typeof walletInfoSchema>;
export type WalletBalance = z.infer<typeof walletBalanceSchema>;
export type WalletTransaction = z.infer<typeof walletTransactionSchema>;
export type EmployeeTransaction = z.infer<typeof employeeTransactionSchema>;
export type EmployeeTransactionsResponse = z.infer<
  typeof employeeTransactionsResponseSchema
>;

// API Functions
export async function getAllWallets(): Promise<WalletInfo[]> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const res = await fetch(buildUrl(`/api/v1/wallet`), {
    method: "GET",
    headers,
  });
  console.log("get all wallet:", { res });

  const data = await handleResponse<WalletInfo[]>(res);
  return z.array(walletInfoSchema).parse(data);
}

export async function getWallet(employeeId: string): Promise<WalletInfo> {
  if (!employeeId) {
    throw new Error("employeeId is required to fetch wallet");
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  console.log("employeeId value:", employeeId, typeof employeeId);
  console.log("Auth headers:", authHeaders);

  const res = await fetch(
    buildUrl(`/api/v1/wallet/${encodeURIComponent(employeeId)}`),
    {
      method: "GET",
      headers,
    },
  );

  console.log("getWallet response status:", res.status);
  console.log("getWallet response:", res);

  const data = await handleResponse<WalletInfo>(res);
  return walletInfoSchema.parse(data);
}

export async function getWalletBalance(
  employeeId: string,
): Promise<WalletBalance> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const res = await fetch(
    buildUrl(`/api/v1/wallet/${encodeURIComponent(employeeId)}/balance`),
    {
      method: "GET",
      headers,
    },
  );

  const data = await handleResponse<WalletBalance>(res);
  return walletBalanceSchema.parse(data);
}

export async function getWalletTransactions(
  walletId: string,
): Promise<WalletTransaction[]> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const res = await fetch(
    buildUrl(`/api/v1/wallet/${encodeURIComponent(walletId)}/transactions`),
    {
      method: "GET",
      headers,
    },
  );

  const data = await handleResponse<
    | {
        data: WalletTransaction[];
        pagination?: {
          page: number;
          size: number;
          total: number;
          totalPages: number;
        };
      }
    | WalletTransaction[]
  >(res);

  const transactions = Array.isArray(data) ? data : data.data;
  return z.array(walletTransactionSchema).parse(transactions);
}

export async function getEmployeeTransactions(
  employeeId: string,
  page = 0,
  size = 10,
): Promise<EmployeeTransactionsResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const res = await fetch(
    buildUrl(
      `/api/v1/transactions/employee/${encodeURIComponent(employeeId)}?page=${page}&size=${size}`,
    ),
    {
      method: "GET",
      headers,
    },
  );

  const data = await handleResponse<EmployeeTransactionsResponse>(res);
  return employeeTransactionsResponseSchema.parse(data);
}
