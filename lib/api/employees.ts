import { z } from "zod";
import Cookies from "js-cookie";
import type { Employee } from "@/lib/types";

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

function normalizeEmployee(employee: EmployeeApi): Employee {
  return {
    ...employee,
    role: employee.role as Employee["role"],
  };
}

export const employeeApiSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  department: z.string(),
  position: z.string(),
  salary: z.number(),
  walletBalance: z.number(),
  financialHealthScore: z.number(),
  attendanceRate: z.number(),
  riskScore: z.number(),
  badge: z.string(),
});

export const employeeListResponseSchema = z.object({
  data: z.array(employeeApiSchema),
  pagination: z.object({
    page: z.number(),
    size: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type EmployeeApi = z.infer<typeof employeeApiSchema>;
export type EmployeeListResponse = z.infer<typeof employeeListResponseSchema>;

export async function getEmployees(
  page = 0,
  size = 10,
): Promise<{
  data: Employee[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const requestPage = page;

  const url = `/api/v1/employees?page=${requestPage}&size=${size}`;
  console.log("Request URL:", url);

  const res = await fetch(buildUrl(url), {
    method: "GET",
    headers,
  });

  const data = await handleResponse<EmployeeListResponse>(res);
  console.log("Employee parsed:", { data });
  const parsed = employeeListResponseSchema.parse(data);

  return {
    data: parsed.data.map(normalizeEmployee),
    pagination: {
      page: parsed.pagination.page,
      size: parsed.pagination.size,
      total: parsed.pagination.total,
      totalPages: parsed.pagination.totalPages,
    },
  };
}

export async function getEmployee(id: string): Promise<Employee> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  console.log("Auth headers:", authHeaders);
  const res = await fetch(
    buildUrl(`/api/v1/employees/${encodeURIComponent(id)}`),
    {
      method: "GET",
      headers,
    },
  );

  const data = await handleResponse<EmployeeApi>(res);
  const parsed = employeeApiSchema.parse(data);
  return normalizeEmployee(parsed);
}

export async function createEmployee(
  payload: Omit<
    Employee,
    | "id"
    | "employeeId"
    | "role"
    | "walletBalance"
    | "financialHealthScore"
    | "attendanceRate"
    | "riskScore"
    | "badge"
  >,
): Promise<Employee> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(buildUrl(`/api/v1/employees`), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return handleResponse<Employee>(res);
}

export async function updateEmployee(
  id: string,
  payload: Partial<EmployeeApi>,
): Promise<EmployeeApi> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(
    buildUrl(`/api/v1/employees/${encodeURIComponent(id)}`),
    {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    },
  );

  return handleResponse<Employee>(res);
}

export async function deleteEmployee(id: string): Promise<void> {
  const headers: Record<string, string> = {};
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }
  const res = await fetch(
    buildUrl(`/api/v1/employees/${encodeURIComponent(id)}`),
    {
      method: "DELETE",
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    },
  );

  if (!res.ok) {
    // Try to parse error response as JSON
    try {
      const errorData = await res.json();
      throw new Error(
        errorData.message || `Failed to delete employee: ${res.statusText}`,
      );
    } catch (parseError) {
      throw new Error(`Failed to delete employee: ${res.statusText}`);
    }
  }
}
