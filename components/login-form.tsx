"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { loginSchema, type LoginFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password);
      if (user) {
        toast.success("Welcome back!");
        router.push(user.role === "ADMIN" ? "/admin" : "/dashboard");
      } else {
        toast.error("Invalid credentials. Try a demo account below.");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
            <Building2 className="size-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              SmartAdvance
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Employee Salary Advance System
            </p>
          </div>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@company.com"
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="mt-2 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="size-4" />
                      Sign in
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-4 border-border/60">
          <CardContent className="p-4">
            <p className="mb-3 text-center text-xs font-medium text-muted-foreground">
              Demo Accounts (password: any)
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  form.setValue("email", "admin@example.com");
                  form.setValue("password", "password123");
                }}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5 text-left transition-colors hover:bg-secondary"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-accent/20 text-xs font-bold text-accent">
                  BK
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    HR manager
                  </p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  form.setValue("email", "vannchhai-dev@gmail.com");
                  form.setValue("password", "employee@123");
                }}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5 text-left transition-colors hover:bg-secondary"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-accent/20 text-xs font-bold text-accent">
                  BK
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Vann Chhai - Employee
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Employee - Developer
                  </p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
