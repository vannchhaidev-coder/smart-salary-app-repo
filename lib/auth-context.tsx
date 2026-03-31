"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";
import type { User, Employee, Admin, Role } from "@/lib/types";
import { useLogin, useCurrentUser, queryClient } from "@/lib/client";

interface AuthContextType {
  user: (User | Employee) | null;
  login: (email: string, password: string) => Promise<User | Employee | null>;
  logout: () => void;
  isEmployee: boolean;
  isAdmin: boolean;
  currentEmployee: Employee | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeBadge(badge?: string | null) {
  if (!badge) return "Unknown";
  return badge
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with loading=true on both server and client to avoid hydration mismatch
  // Hydrate from localStorage in an effect after client mounts
  const [user, setUser] = useState<User | Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const loginMutation = useLogin();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  // Hydrate from localStorage after client mounts (avoids hydration mismatch)
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user");
      }
    } else {
      setIsLoading(false);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!userLoading && !isHydrated) {
      return; // Wait for hydration to complete
    }

    if (!userLoading) {
      let user = currentUser;

      if (user && user.role === "EMPLOYEE") {
        const fetchEmployeeData = async () => {
          try {
            const token = Cookies.get("accessToken");
            if (!token) {
              console.log("No access token, using cached employee data");
              const employeeFromUser: Employee = {
                ...(user as User),
                employeeId: (user as any).employeeId || "",
                salary: (user as any).salary || 0,
                walletBalance: (user as any).walletBalance || 0,
                financialHealthScore: (user as any).financialHealthScore || 0,
                attendanceRate: (user as any).attendanceRate || 0,
                riskScore: (user as any).riskScore || 0,
                badge: normalizeBadge((user as any).badge),
              } as Employee;
              setUser(employeeFromUser);
              setIsLoading(false);
              return;
            }

            const employeeId = (user as any).id || (user as any).uuid;
            if (!employeeId) {
              console.log("No employee ID found, using cached data");
              const employeeFromUser: Employee = {
                ...(user as User),
                employeeId: (user as any).employeeId || "",
                salary: (user as any).salary || 0,
                walletBalance: (user as any).walletBalance || 0,
                financialHealthScore: (user as any).financialHealthScore || 0,
                attendanceRate: (user as any).attendanceRate || 0,
                riskScore: (user as any).riskScore || 0,
                badge: normalizeBadge((user as any).badge),
              } as Employee;
              setUser(employeeFromUser);
              setIsLoading(false);
              return;
            }

            console.log("Fetching full employee data for:", employeeId);
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/employees/${encodeURIComponent(employeeId)}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (res.ok) {
              const employee = await res.json();
              console.log("Fetched employee data:", employee);
              const enrichedUser = {
                ...employee,
                id: employee.id || employeeId,
                uuid: (user as any).uuid,
                employeeId: employee.employeeId,
                role: "EMPLOYEE" as const,
                badge: normalizeBadge(employee.badge),
              } as Employee;
              setUser(enrichedUser);
              localStorage.setItem("user", JSON.stringify(enrichedUser));
            } else {
              console.log("Failed to fetch employee data, using cached");
              const employeeFromUser: Employee = {
                ...(user as User),
                employeeId: (user as any).employeeId || "",
                salary: (user as any).salary || 0,
                walletBalance: (user as any).walletBalance || 0,
                financialHealthScore: (user as any).financialHealthScore || 0,
                attendanceRate: (user as any).attendanceRate || 0,
                riskScore: (user as any).riskScore || 0,
                badge: normalizeBadge((user as any).badge),
              } as Employee;
              setUser(employeeFromUser);
            }
          } catch (err) {
            console.error("Error fetching employee data:", err);
            const employeeFromUser: Employee = {
              ...(user as User),
              employeeId: (user as any).employeeId || "",
              salary: (user as any).salary || 0,
              walletBalance: (user as any).walletBalance || 0,
              financialHealthScore: (user as any).financialHealthScore || 0,
              attendanceRate: (user as any).attendanceRate || 0,
              riskScore: (user as any).riskScore || 0,
              badge: normalizeBadge((user as any).badge),
            } as Employee;
            setUser(employeeFromUser);
          }
          setIsLoading(false);
        };

        fetchEmployeeData();
        return;
      } else if (user) {
        const normalizedRole = user.role;
        const normalizedBadge = normalizeBadge((user as any).badge);
        user = {
          ...(user as any),
          role: normalizedRole,
          badge: normalizedBadge,
        } as User;
        setUser(user);
      }
      setIsLoading(false);
    }
  }, [currentUser, userLoading, isHydrated]);

  const login = async (
    email: string,
    password: string,
  ): Promise<User | Employee | null> => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success) {
        let user: User | Employee = result.data.user as any;
        console.log("Raw API user:", user);
        const normalizedRole = user.role;
        const normalizedBadge = normalizeBadge((user as any).badge);

        if (normalizedRole === "EMPLOYEE") {
          const employeeData = user as any;
          const userId = employeeData.id || employeeData.uuid;
          const accessToken = result.data.tokens?.accessToken;

          if (userId && accessToken) {
            try {
              console.log(
                "Fetching full employee data during login for:",
                userId,
              );
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/employees/${encodeURIComponent(userId)}`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                },
              );

              if (res.ok) {
                const fullEmployee = await res.json();
                console.log(
                  "Fetched full employee data during login:",
                  fullEmployee,
                );
                user = {
                  ...fullEmployee,
                  id: fullEmployee.id || userId,
                  uuid: employeeData.uuid,
                  employeeId: fullEmployee.employeeId,
                  role: normalizedRole as "EMPLOYEE",
                  badge: normalizeBadge(fullEmployee.badge ?? normalizedBadge),
                } as Employee;
              } else {
                console.log(
                  "Could not fetch full employee data, using login response",
                );
                user = {
                  ...employeeData,
                  id: userId,
                  uuid: employeeData.uuid,
                  employeeId: employeeData.employeeId,
                  role: normalizedRole as "EMPLOYEE",
                  badge: normalizeBadge(employeeData.badge ?? normalizedBadge),
                } as Employee;
              }
            } catch (err) {
              console.error("Failed to fetch full employee data:", err);
              // Fallback to login response data
              user = {
                ...employeeData,
                id: userId,
                uuid: employeeData.uuid,
                employeeId: employeeData.employeeId,
                role: normalizedRole as "EMPLOYEE",
                badge: normalizeBadge(employeeData.badge ?? normalizedBadge),
              } as Employee;
            }
          } else {
            user = {
              ...employeeData,
              id: userId,
              uuid: employeeData.uuid,
              employeeCode: employeeData.employeeId,
              role: normalizedRole as "EMPLOYEE",
              badge: normalizeBadge(employeeData.badge ?? normalizedBadge),
            } as Employee;
          }
          console.log("Normalized employee user:", user);
        } else {
          user = {
            ...(user as any),
            role: normalizedRole,
            badge: normalizedBadge,
          } as User;
        }

        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        console.log("Stored to localStorage:", user);
        setIsLoading(false);
        return user;
      }
      setIsLoading(false);
      return null;
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  };

  const isEmployee = user?.role === "EMPLOYEE";
  const isAdmin = user?.role === "ADMIN";
  const currentEmployee = isEmployee ? (user as Employee) : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isEmployee,
        isAdmin,
        currentEmployee,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
