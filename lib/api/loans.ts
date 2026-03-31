import Cookies from "js-cookie";
import type { LoanRequest, LoanTransaction } from "@/lib/types";

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

function normalizeLoan(loan: LoanRequest): LoanRequest {
  return {
    ...loan,
    status: loan.status.toLowerCase() as LoanRequest["status"],
    riskLevel: loan.riskLevel.toLowerCase() as LoanRequest["riskLevel"],
  };
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

export interface LoanListResponse {
  data: LoanRequest[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export async function getLoans(page = 0, size = 10): Promise<LoanListResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(buildUrl(`/api/v1/loans?page=${page}&size=${size}`), {
    method: "GET",
    headers,
  });

  const data = await handleResponse<
    | {
        data: LoanRequest[];
        pagination?: {
          page: number;
          size: number;
          total: number;
          totalPages: number;
        };
      }
    | LoanRequest[]
  >(res);

  if (Array.isArray(data)) {
    const normalizedData = data.map(normalizeLoan);
    return {
      data: normalizedData,
      pagination: {
        page,
        size,
        total: normalizedData.length,
        totalPages: 1,
      },
    };
  }

  return {
    data: data.data.map(normalizeLoan),
    pagination: {
      page: data.pagination?.page ?? page,
      size: data.pagination?.size ?? size,
      total: data.pagination?.total ?? data.data.length,
      totalPages: data.pagination?.totalPages ?? 1,
    },
  };
}

export async function getEmployeeLoans(
  page = 0,
  size = 10,
): Promise<LoanListResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(
    buildUrl(`/api/v1/loans/employees?page=${page}&size=${size}`),
    {
      method: "GET",
      headers,
    },
  );

  const data = await handleResponse<
    | {
        data: LoanRequest[];
        pagination?: {
          page: number;
          size: number;
          total: number;
          totalPages: number;
        };
      }
    | LoanRequest[]
  >(res);

  if (Array.isArray(data)) {
    const normalizedData = data.map(normalizeLoan);
    return {
      data: normalizedData,
      pagination: {
        page,
        size,
        total: normalizedData.length,
        totalPages: 1,
      },
    };
  }

  return {
    data: data.data.map(normalizeLoan),
    pagination: {
      page: data.pagination?.page ?? page,
      size: data.pagination?.size ?? size,
      total: data.pagination?.total ?? data.data.length,
      totalPages: data.pagination?.totalPages ?? 1,
    },
  };
}

export async function getLoan(uuid: string): Promise<LoanRequest> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(
    buildUrl(`/api/v1/loans/${encodeURIComponent(uuid)}`),
    {
      method: "GET",
      headers,
    },
  );

  const loan = await handleResponse<LoanRequest>(res);
  return normalizeLoan(loan);
}

export async function createLoan(
  payload: Omit<
    LoanRequest,
    | "id"
    | "uuid"
    | "status"
    | "riskScore"
    | "riskLevel"
    | "monthlyDeduction"
    | "remainingBalance"
    | "approvedDate"
    | "approvedBy"
  >,
): Promise<LoanRequest> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  console.log("Payload:", payload);

  const res = await fetch(buildUrl(`/api/v1/loans`), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return handleResponse<LoanRequest>(res);
}

export async function updateLoan(
  uuid: string,
  payload: Partial<LoanRequest>,
): Promise<LoanRequest> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(
    buildUrl(`/api/v1/loans/${encodeURIComponent(uuid)}`),
    {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    },
  );

  return handleResponse<LoanRequest>(res);
}

export async function approveLoan(uuid: string): Promise<LoanRequest> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const res = await fetch(
    buildUrl(`/api/v1/loans/${encodeURIComponent(uuid)}/approve`),
    {
      method: "PUT",
      headers,
    },
  );

  const loan = await handleResponse<LoanRequest>(res);
  return normalizeLoan(loan);
}

export async function rejectLoan(uuid: string): Promise<LoanRequest> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const res = await fetch(
    buildUrl(`/api/v1/loans/${encodeURIComponent(uuid)}/reject`),
    {
      method: "PUT",
      headers,
    },
  );

  const loan = await handleResponse<LoanRequest>(res);
  return normalizeLoan(loan);
}

export async function getEmployeeDebt(employeeUuid: string): Promise<number> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const res = await fetch(
    buildUrl(
      `/api/v1/loans/employees/${encodeURIComponent(employeeUuid)}/debt`,
    ),
    {
      method: "GET",
      headers,
    },
  );

  const data = await handleResponse<{ debt?: number } | number>(res);
  if (typeof data === "number") {
    return data;
  }
  return data.debt ?? 0;
}

export async function getLoanTransactions(
  uuid: string,
): Promise<LoanTransaction[]> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const res = await fetch(
    buildUrl(`/api/v1/loans/${encodeURIComponent(uuid)}/transactions`),
    {
      method: "GET",
      headers,
    },
  );

  return handleResponse<LoanTransaction[]>(res);
}

export async function createLoanTransaction(
  uuid: string,
  payload: Omit<LoanTransaction, "id" | "loanId">,
): Promise<LoanTransaction> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const res = await fetch(
    buildUrl(`/api/v1/loans/${encodeURIComponent(uuid)}/transactions`),
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
  );

  return handleResponse<LoanTransaction>(res);
}

export async function deleteLoan(uuid: string): Promise<void> {
  const headers: Record<string, string> = {};
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(
    buildUrl(`/api/v1/loans/${encodeURIComponent(uuid)}`),
    {
      method: "DELETE",
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    },
  );

  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(
        errorData.message || `Failed to delete loan: ${res.statusText}`,
      );
    } catch (parseError) {
      throw new Error(`Failed to delete loan: ${res.statusText}`);
    }
  }
}
