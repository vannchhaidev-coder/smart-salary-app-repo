"use client";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import Cookies from "js-cookie";
import { login } from "@/lib/api/auth";
import type { AuthResponse } from "@/lib/api/auth";
import type { User, Employee, LoanRequest, LoanTransaction } from "@/lib/types";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/api/employees";
import type { EmployeeListResponse, EmployeeApi } from "@/lib/api/employees";
import {
  getLoans,
  getEmployeeLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
  approveLoan,
  getEmployeeDebt,
  getLoanTransactions,
  createLoanTransaction,
  rejectLoan,
} from "@/lib/api/loans";
import type { LoanListResponse } from "@/lib/api/loans";
import { getAnalyticsSummary, getAnalyticsLoans } from "@/lib/api/analytics";
import type { AnalyticsSummary, AnalyticsLoans } from "@/lib/api/analytics";
import {
  getAllWallets,
  getEmployeeTransactions,
  getWallet,
  getWalletBalance,
  getWalletTransactions,
} from "@/lib/api/wallet";
import type {
  WalletInfo,
  WalletBalance,
  WalletTransaction,
  EmployeeTransaction,
  EmployeeTransactionsResponse,
} from "@/lib/api/wallet";

export const queryClient = new QueryClient();

export function useLogin(): UseMutationResult<
  AuthResponse,
  Error,
  { email: string; password: string }
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      // store tokens in cookies with secure settings
      Cookies.set("accessToken", data.data.tokens.accessToken, {
        expires: 7,
        path: "/", // ensure cookie is available on all paths
        secure: false, // set to true in production with HTTPS
        sameSite: "Lax", // allow cross-site requests
      });
      Cookies.set("refreshToken", data.data.tokens.refreshToken, {
        expires: 30,
        path: "/",
        secure: false,
        sameSite: "Lax",
      });

      // store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // invalidate any user-related queries
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useCurrentUser(): UseQueryResult<User | null, Error> {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => {
      const token = Cookies.get("accessToken");
      if (!token) return null;
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    },
    staleTime: Infinity, // data from storage doesn't change often
  });
}

export function useEmployees(
  page = 0,
  size = 10,
): UseQueryResult<
  {
    data: Employee[];
    pagination: {
      page: number;
      size: number;
      total: number;
      totalPages: number;
    };
  },
  Error
> {
  console.log();
  return useQuery({
    queryKey: ["employees", page, size],
    queryFn: () => getEmployees(page, size),
  });
}

export function useEmployee(id: string): UseQueryResult<Employee, Error> {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee(): UseMutationResult<
  EmployeeApi,
  Error,
  Omit<
    EmployeeApi,
    | "id"
    | "employeeId"
    | "role"
    | "walletBalance"
    | "financialHealthScore"
    | "attendanceRate"
    | "riskScore"
    | "badge"
  >
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees", 0, 10] });
      qc.invalidateQueries({ queryKey: ["employees", 0, 1000] });
    },
  });
}

export function useUpdateEmployee(): UseMutationResult<
  EmployeeApi,
  Error,
  { id: string; data: Partial<EmployeeApi> }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateEmployee(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees", 0, 10] });
      qc.invalidateQueries({ queryKey: ["employees", 0, 1000] });
    },
  });
}

export function useDeleteEmployee(): UseMutationResult<void, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useLoans(
  page = 0,
  size = 10,
): UseQueryResult<LoanListResponse, Error> {
  return useQuery({
    queryKey: ["loans", page, size],
    queryFn: () => getLoans(page, size),
  });
}

export function useEmployeeLoans(
  page = 0,
  size = 10,
): UseQueryResult<LoanListResponse, Error> {
  return useQuery({
    queryKey: ["employeeLoans", page, size],
    queryFn: () => getEmployeeLoans(page, size),
  });
}

export function useLoan(uuid: string): UseQueryResult<LoanRequest, Error> {
  return useQuery({
    queryKey: ["loan", uuid],
    queryFn: () => getLoan(uuid),
  });
}

export function useCreateLoan(): UseMutationResult<
  LoanRequest,
  Error,
  Omit<
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
  >
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

export function useUpdateLoan(): UseMutationResult<
  LoanRequest,
  Error,
  { id: string; data: Partial<LoanRequest> }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateLoan(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

export function useApproveLoan(): UseMutationResult<
  LoanRequest,
  Error,
  string
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveLoan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

export function useRejectLoan() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => rejectLoan(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

export function useEmployeeDebt(
  employeeUuid: string,
): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: ["employeeDebt", employeeUuid],
    queryFn: () => getEmployeeDebt(employeeUuid),
    enabled: Boolean(employeeUuid),
  });
}

export function useLoanTransactions(
  uuid: string,
): UseQueryResult<LoanTransaction[], Error> {
  return useQuery({
    queryKey: ["loanTransactions", uuid],
    queryFn: () => getLoanTransactions(uuid),
    enabled: Boolean(uuid),
  });
}

export function useCreateLoanTransaction(): UseMutationResult<
  LoanTransaction,
  Error,
  { uuid: string; payload: Omit<LoanTransaction, "id" | "loanId"> }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }) => createLoanTransaction(uuid, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["loanTransactions", variables.uuid] });
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

export function useDeleteLoan(): UseMutationResult<void, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLoan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

export function useAnalyticsSummary(): UseQueryResult<AnalyticsSummary, Error> {
  return useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => getAnalyticsSummary(),
  });
}

export function useAnalyticsLoans(): UseQueryResult<AnalyticsLoans, Error> {
  return useQuery({
    queryKey: ["analyticsLoans"],
    queryFn: () => getAnalyticsLoans(),
  });
}

export function useAllWallets(): UseQueryResult<WalletInfo[], Error> {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: () => getAllWallets(),
  });
}

export function useWallet(
  employeeId: string,
): UseQueryResult<WalletInfo, Error> {
  return useQuery({
    queryKey: ["wallet", employeeId],
    queryFn: () => getWallet(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useWalletBalance(
  employeeId: string,
): UseQueryResult<WalletBalance, Error> {
  return useQuery({
    queryKey: ["walletBalance", employeeId],
    queryFn: () => getWalletBalance(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useWalletTransactions(
  walletUuid: string,
): UseQueryResult<WalletTransaction[], Error> {
  return useQuery({
    queryKey: ["walletTransactions", walletUuid],
    queryFn: () => getWalletTransactions(walletUuid),
    enabled: Boolean(walletUuid),
  });
}

export function useEmployeeTransactions(
  employeeId: string,
  page = 0,
  size = 10,
): UseQueryResult<EmployeeTransactionsResponse, Error> {
  return useQuery({
    queryKey: ["employeeTransactions", employeeId, page, size],
    queryFn: () => getEmployeeTransactions(employeeId, page, size),
    enabled: Boolean(employeeId),
  });
}
