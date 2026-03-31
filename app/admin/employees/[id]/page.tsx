"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEmployee } from "@/lib/api/employees";
import { mockEmployees } from "@/lib/mock-data";
import type { Employee } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) return;

    setLoading(true);
    setError(null);

    getEmployee(id)
      .then((data) => setEmployee(data))
      .catch((err) => {
        console.warn(err);
        const fallback = mockEmployees.find((e) => e.id === id);
        if (fallback) {
          setEmployee(fallback);
          toast.error("Failed to load from API; showing demo data.");
          return;
        }

        setError("Unable to load employee details.");
        toast.error("Failed to load employee details.");
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Employee details
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View the profile information for the selected employee.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/employees")}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            {employee ? employee.name : "Loading employee info..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : employee ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium text-foreground">
                  {employee.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">
                  {employee.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium text-foreground">
                  {employee.department}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Position</p>
                <p className="text-sm font-medium text-foreground">
                  {employee.position}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary</p>
                <p className="text-sm font-medium text-foreground">
                  ${employee.salary.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Join Date</p>
                <p className="text-sm font-medium text-foreground">
                  {employee.joinDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Risk Score</p>
                <p className="text-sm font-medium text-foreground">
                  {employee.riskScore}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Health Score</p>
                <p className="text-sm font-medium text-foreground">
                  {employee.financialHealthScore}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
