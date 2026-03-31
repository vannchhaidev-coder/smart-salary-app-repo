"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HandCoins,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCreateLoan } from "@/lib/client";
import { loanRequestSchema, type LoanRequestFormValues } from "@/lib/schemas";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

function getRiskDecision(score: number) {
  if (score >= 80)
    return {
      label: "Auto Approved",
      color: "text-accent",
      bg: "bg-accent/10",
      icon: CheckCircle2,
    };
  if (score >= 50)
    return {
      label: "Admin Review",
      color: "text-primary",
      bg: "bg-primary/10",
      icon: ShieldCheck,
    };
  return {
    label: "Likely Rejected",
    color: "text-destructive",
    bg: "bg-destructive/10",
    icon: AlertTriangle,
  };
}

export default function RequestAdvancePage() {
  const { currentEmployee } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const createLoanMutation = useCreateLoan();

  const form = useForm<LoanRequestFormValues>({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: { amount: 500, reason: "", repaymentMonths: 3 },
  });

  if (!currentEmployee) return null;

  const decision = getRiskDecision(currentEmployee?.riskScore ?? 0);
  const DecisionIcon = decision.icon;
  const watchAmount = form.watch("amount");
  const watchMonths = form.watch("repaymentMonths");
  const monthlyDeduction =
    watchAmount && watchMonths
      ? (watchAmount / watchMonths).toFixed(2)
      : "0.00";
  const maxAdvance = Math.round((currentEmployee?.salary ?? 0) * 0.5);

  console.log(currentEmployee.riskScore);

  function onSubmit(data: LoanRequestFormValues) {
    if (!currentEmployee) return;
    if (data.amount > maxAdvance) {
      toast.error(`Maximum advance amount is $${maxAdvance} (50% of salary)`);
      return;
    }

    createLoanMutation.mutate(
      {
        employeeId: currentEmployee.employeeId,
        amount: data.amount,
        reason: data.reason,
        repaymentMonths: data.repaymentMonths,
        requestDate: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success(
            (currentEmployee?.riskScore ?? 0) >= 80
              ? "Your advance has been auto-approved!"
              : "Your request has been submitted for admin review.",
          );
        },
        onError: (error) => {
          toast.error(`Failed to submit request: ${error.message}`);
        },
      },
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent/15">
          <CheckCircle2 className="size-8 text-accent" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            Request Submitted
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {(currentEmployee?.riskScore ?? 0) >= 80
              ? "Your salary advance has been auto-approved based on your excellent risk score."
              : "Your request is pending admin review. You will be notified once a decision is made."}
          </p>
        </div>
        <Button onClick={() => setSubmitted(false)} variant="outline">
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Request Salary Advance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit a request for an early salary payment
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HandCoins className="size-4 text-primary" />
                Advance Details
              </CardTitle>
              <CardDescription>
                Fill in the details for your salary advance request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-5"
                >
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advance Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Max: ${maxAdvance} (50% of monthly salary)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Request</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe why you need this salary advance..."
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="repaymentMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repayment Period</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(Number(v))}
                          defaultValue={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select months" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map((m) => (
                              <SelectItem key={m} value={String(m)}>
                                {m} {m === 1 ? "month" : "months"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="mt-2"
                    disabled={createLoanMutation.isPending}
                  >
                    {createLoanMutation.isPending ? (
                      <>
                        <span className="mr-2 size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <HandCoins className="mr-2 size-4" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="flex flex-col gap-4">
          {/* Risk Score */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Your Risk Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-foreground">
                  {currentEmployee?.riskScore ?? 0}
                </span>
                <Badge variant="outline" className={decision.color}>
                  {(currentEmployee?.badge ?? "Fair")
                    .toLowerCase()
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
              </div>
              <Progress
                value={currentEmployee?.riskScore ?? 0}
                className="h-2"
              />
              <div
                className={`mt-1 flex items-center gap-2 rounded-lg p-3 ${decision.bg}`}
              >
                <DecisionIcon className={`size-4 ${decision.color}`} />
                <span className={`text-sm font-medium ${decision.color}`}>
                  {decision.label}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Repayment Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calculator className="size-4 text-muted-foreground" />
                Repayment Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Advance Amount</span>
                <span className="font-semibold text-foreground">
                  ${watchAmount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Repayment Period</span>
                <span className="font-semibold text-foreground">
                  {watchMonths || 0} months
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Monthly Deduction
                  </span>
                  <span className="text-lg font-bold text-primary">
                    ${monthlyDeduction}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Attendance (40%)</span>
                <span className="font-medium text-foreground">
                  {currentEmployee?.attendanceRate ?? 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Repayment Hx (30%)
                </span>
                <span className="font-medium text-foreground">Good</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Salary Stability (20%)
                </span>
                <span className="font-medium text-foreground">Stable</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Existing Debt (10%)
                </span>
                <span className="font-medium text-foreground">Low</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
