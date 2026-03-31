import Cookies from "js-cookie";
import type { SalaryRecord } from "@/lib/types";

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

export interface SalaryRecordListResponse {
  data: SalaryRecord[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface SalaryRecordDetailResponse {
  success: boolean;
  data: SalaryRecord & {
    processedDate: string | null;
    deductionBreakdown: Array<{
      type: string;
      loanId?: string;
      amount: number;
      description: string;
    }>;
  };
}

export interface ProcessAllResponse {
  success: boolean;
  message: string;
  data: {
    processed: number;
    totalAmount: number;
  };
}

export async function getSalaryRecords(
  page = 0,
  size = 10,
): Promise<SalaryRecordListResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(
    buildUrl(`/api/v1/admin/salary?page=${page}&size=${size}`),
    {
      method: "GET",
      headers,
    },
  );

  return handleResponse<SalaryRecordListResponse>(res);
}

export async function getSalaryRecord(
  id: string,
): Promise<SalaryRecordDetailResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(buildUrl(`/api/v1/admin/salary/${id}`), {
    method: "GET",
    headers,
  });

  return handleResponse<SalaryRecordDetailResponse>(res);
}

export async function createSalaryRecord(data: {
  employeeId: string;
  baseSalary: number;
  deductions: number;
  month: string;
}): Promise<{ success: boolean; data: SalaryRecord }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(buildUrl(`/api/v1/admin/salary`), {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse<{ success: boolean; data: SalaryRecord }>(res);
}

export async function updateSalaryRecord(
  id: string,
  data: Partial<{
    baseSalary: number;
    deductions: number;
    status: string;
  }>,
): Promise<{ success: boolean; data: SalaryRecord }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(buildUrl(`/api/v1/admin/salary/${id}`), {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse<{ success: boolean; data: SalaryRecord }>(res);
}

export async function deleteSalaryRecord(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(buildUrl(`/api/admin/salary/${id}`), {
    method: "DELETE",
    headers,
  });

  return handleResponse<{ success: boolean; message: string }>(res);
}

export async function processAllPendingSalaries(): Promise<ProcessAllResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(buildUrl(`/api/v1/admin/salary/process-all`), {
    method: "POST",
    headers,
  });

  return handleResponse<ProcessAllResponse>(res);
}
