"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  HandCoins,
  History,
  HeartPulse,
  Users,
  BadgeDollarSign,
  ClipboardCheck,
  BarChart3,
  LogOut,
  Building2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const employeeNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { title: "Request Advance", href: "/dashboard/request", icon: HandCoins },
  { title: "Loan History", href: "/dashboard/loans", icon: History },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: BadgeDollarSign,
  },
  { title: "Financial Health", href: "/dashboard/health", icon: HeartPulse },
];

const adminNav = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Employees", href: "/admin/employees", icon: Users },
  { title: "Loan Approvals", href: "/admin/loans", icon: ClipboardCheck },
  { title: "Salary Management", href: "/admin/salary", icon: BadgeDollarSign },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const navItems = isAdmin ? adminNav : employeeNav;

  if (!user) return null;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link
          href={isAdmin ? "/admin" : "/dashboard"}
          className="flex items-center gap-2.5"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="size-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              SmartAdvance
            </span>
            <span className="text-[11px] text-sidebar-foreground/60">
              Salary Advance System
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isAdmin ? "Administration" : "My Account"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user.name}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {user.email}
            </span>
          </div>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            aria-label="Logout"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
