import { NextRequest, NextResponse } from "next/server";
import type { SalaryRecord } from "@/lib/types";

// Mock data for demonstration - in real app, this would come from database
const mockSalaryRecords: SalaryRecord[] = [
  {
    id: "sal-rec-001",
    employeeId: "emp-001",
    employeeName: "John Doe",
    department: "Engineering",
    baseSalary: 5000,
    deductions: 500,
    netSalary: 4500,
    month: "2024-03",
    status: "pending",
  },
  {
    id: "sal-rec-002",
    employeeId: "emp-002",
    employeeName: "Jane Smith",
    department: "Marketing",
    baseSalary: 4500,
    deductions: 450,
    netSalary: 4050,
    month: "2024-03",
    status: "processed",
  },
];

// GET /api/admin/salary - List all salary records with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");

    // In real implementation, fetch from database with pagination
    const start = page * size;
    const end = start + size;
    const data = mockSalaryRecords.slice(start, end);

    const response = {
      data,
      pagination: {
        page,
        size,
        total: mockSalaryRecords.length,
        totalPages: Math.ceil(mockSalaryRecords.length / size),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch salary records" },
      { status: 500 },
    );
  }
}

// POST /api/admin/salary - Create or update a salary record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      employeeId,
      employeeName,
      department,
      baseSalary,
      deductions,
      month,
    } = body;

    if (
      !employeeId ||
      !employeeName ||
      !department ||
      baseSalary === undefined ||
      deductions === undefined ||
      !month
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Calculate net salary
    const netSalary = baseSalary - deductions;

    // In real implementation, save to database
    const newRecord: SalaryRecord = {
      id: `sal-rec-${Date.now()}`, // Generate ID
      employeeId,
      employeeName,
      department,
      baseSalary,
      deductions,
      netSalary,
      month,
      status: "pending",
    };

    // Add to mock data (in real app, persist to DB)
    mockSalaryRecords.push(newRecord);

    return NextResponse.json(
      {
        message: "Salary record created successfully",
        data: newRecord,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create salary record" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/salary/[id] - Update a specific salary record
// Note: For individual record updates, you'd typically use /api/admin/salary/[id]/route.ts
// But for simplicity, this draft shows the pattern

// Sample JSON for POST request:
// {
//   "employeeId": "emp-003",
//   "employeeName": "Alice Johnson",
//   "department": "HR",
//   "baseSalary": 4800,
//   "deductions": 480,
//   "month": "2024-03"
// }

// Sample JSON response for GET:
// {
//   "data": [
//     {
//       "id": "sal-rec-001",
//       "employeeId": "emp-001",
//       "employeeName": "John Doe",
//       "department": "Engineering",
//       "baseSalary": 5000,
//       "deductions": 500,
//       "netSalary": 4500,
//       "month": "2024-03",
//       "status": "pending"
//     }
//   ],
//   "pagination": {
//     "page": 0,
//     "size": 10,
//     "total": 2,
//     "totalPages": 1
//   }
// }
