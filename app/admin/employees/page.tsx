"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Users, Edit, Eye, Trash2, Filter } from "lucide-react";
import { mockEmployees } from "@/lib/mock-data";
import { employeeSchema, type EmployeeFormValues } from "@/lib/schemas";
import type { Employee } from "@/lib/types";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "@/lib/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

function getBadgeVariant(badge: string) {
  const normalized = badge.trim().toLowerCase();

  console.log("status", normalized);
  switch (normalized) {
    case "excellent":
      return "default";
    case "good":
      return "secondary";
    case "needs_improvement":
      return "outline";
    case "poor":
      return "destructive";
    default:
      return "secondary";
  }
}

function normalizeBadgeLabel(badge: string) {
  return badge.trim().toLowerCase();
}

const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "Finance",
  "HR",
  "Operations",
];

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  const [page, setPage] = useState(0);
  const size = 10;

  const { data: employeeResponse, isLoading, error } = useEmployees(page, size);
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();

  console.log("employee data:", { data: employeeResponse });

  const apiEmployees = employeeResponse?.data || [];
  const total = employeeResponse?.pagination.total || 0;
  const totalPages = employeeResponse?.pagination.totalPages || 1;

  const shouldUseMock = error || (page === 0 && apiEmployees.length === 0);
  const displayEmployees = shouldUseMock
    ? mockEmployees.slice(page * size, (page + 1) * size)
    : apiEmployees;
  const displayTotal = shouldUseMock ? mockEmployees.length : total;
  const displayTotalPages = shouldUseMock
    ? Math.ceil(mockEmployees.length / size)
    : totalPages;

  // Get unique positions from employees
  const positions = useMemo<string[]>(() => {
    const allEmployees = shouldUseMock ? mockEmployees : apiEmployees;
    const uniquePositions = Array.from(
      new Set(allEmployees.map((emp) => emp.position)),
    );
    return uniquePositions.sort();
  }, [apiEmployees, error, shouldUseMock]);

  // Show error toast when API fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to load employees from API; showing demo data.");
    }
  }, [error]);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      position: "",
      salary: 2000,
    },
  });

  const filtered = useMemo(
    () =>
      displayEmployees.filter((e) => {
        const matchesSearch =
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.department.toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase());
        const matchesDepartment =
          filterDepartment === "all" || e.department === filterDepartment;
        return matchesSearch && matchesDepartment;
      }),
    [displayEmployees, search, filterDepartment],
  );

  // Get all unique departments for filtering
  const allDepartments = useMemo(() => {
    const uniqueDepts = Array.from(
      new Set(displayEmployees.map((emp) => emp.department)),
    );
    return uniqueDepts.sort();
  }, [displayEmployees]);

  // Get top departments by employee count (max 3 to fit the grid)
  const departments = useMemo(() => {
    const deptCounts = displayEmployees.reduce(
      (acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(deptCounts)
      .sort(([, a]: [string, number], [, b]: [string, number]) => b - a) // Sort by count descending
      .slice(0, 3) // Take top 3
      .map(([dept]) => dept);
  }, [displayEmployees]);

  async function onSubmit(data: EmployeeFormValues) {
    if (dialogMode === "edit" && activeEmployee) {
      try {
        await updateEmployeeMutation.mutateAsync({
          id: activeEmployee.id,
          data: { ...activeEmployee, ...data },
        });
        toast.success(`${data.name} has been updated.`);
      } catch (error) {
        toast.error("Failed to update employee");
        console.error(error);
      }
    } else {
      try {
        await createEmployeeMutation.mutateAsync(data);
        toast.success(`${data.name} has been added as an employee.`);
      } catch (error) {
        toast.error("Failed to create employee");
        console.error(error);
      }
    }

    form.reset();
    setActiveEmployee(null);
    setDialogOpen(false);
  }

  function openAddDialog() {
    setDialogMode("add");
    setActiveEmployee(null);
    form.reset();
    setDialogOpen(true);
  }

  function openEditDialog(employee: Employee) {
    setDialogMode("edit");
    setActiveEmployee(employee);
    form.reset({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      salary: employee.salary,
    });
    setDialogOpen(true);
  }

  async function handleDelete(employee: Employee) {
    const confirmed = window.confirm(
      `Delete ${employee.name}? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await deleteEmployeeMutation.mutateAsync(employee.id);
      toast.success(`${employee.name} has been deleted.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete employee";
      toast.error(message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Employee Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage employee accounts
          </p>
          {isLoading ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Loading employees…
            </p>
          ) : null}
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 size-4" />
          Add Employee
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "edit" ? "Edit Employee" : "Add New Employee"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details to{" "}
                {dialogMode === "edit" ? "update" : "create"} an employee
                account.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="employee@company.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {positions.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Salary ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Salary"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="mt-2">
                  {dialogMode === "edit"
                    ? "Update Employee"
                    : "Create Employee"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {allDepartments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">
                {displayEmployees.length}
              </p>
            </div>
          </CardContent>
        </Card>
        {departments.map((dept) => (
          <Card key={dept}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{dept}</p>
              <p className="text-2xl font-bold text-foreground">
                {displayEmployees.filter((e) => e.department === dept).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Employees</CardTitle>
          <CardDescription>{filtered.length} employees found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                        {emp.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {emp.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {emp.department}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {emp.position}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    ${emp.salary.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {emp.riskScore}
                      </span>
                      <Progress value={emp.riskScore} className="h-1.5 w-12" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(emp.badge)}>
                      {normalizeBadgeLabel(emp.badge)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {emp.financialHealthScore}
                      </span>
                      <Progress
                        value={emp.financialHealthScore}
                        className="h-1.5 w-12"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          router.push(`/admin/employees/${emp.id}`)
                        }
                        title="View details"
                      >
                        <Eye />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(emp)}
                        title="Edit employee"
                      >
                        <Edit />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(emp)}
                        title="Delete employee"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex flex-col gap-2 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(page * size + 1, displayTotal)}–
            {Math.min((page + 1) * size, displayTotal)} of {displayTotal}{" "}
            employees
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(displayTotalPages - 1, p + 1))
              }
              disabled={page >= displayTotalPages - 1 || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
