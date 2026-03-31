import { z } from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function buildUrl(path: string) {
  if (BASE_URL) {
    return `${BASE_URL.replace(/\/$/, "")}${path}`;
  }
  return path;
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

export const authResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: z.object({
      id: z.string().optional(),
      uuid: z.string(),
      email: z.string().email(),
      name: z.string(),
      role: z.string(),
      department: z.string().nullable(),
      employeeId: z.string().nullable(),
      position: z.string().nullable(),
      badge: z.string().nullable(),
      salary: z.number().optional(),
      walletBalance: z.number().optional(),
      financialHealthScore: z.number().optional(),
      attendanceRate: z.number().optional(),
      riskScore: z.number().optional(),
    }),
    tokens: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
    }),
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(buildUrl(`/api/v1/auth/login`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse<unknown>(res);

  const parsed = authResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid login response: ${parsed.error.message}`);
  }

  return parsed.data;
}
