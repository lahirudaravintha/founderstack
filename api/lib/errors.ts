import { NextResponse } from "next/server";

type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

const STATUS_MAP: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }

  get status(): number {
    return STATUS_MAP[this.code];
  }
}

export function errorResponse(code: ErrorCode, message: string): NextResponse {
  const status = STATUS_MAP[code];
  return NextResponse.json({ error: { code, message, status } }, { status });
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return errorResponse(err.code, err.message);
  }

  // Zod validation errors
  if (
    err &&
    typeof err === "object" &&
    "issues" in err &&
    Array.isArray((err as { issues: unknown[] }).issues)
  ) {
    return errorResponse(
      "VALIDATION_ERROR",
      (err as { issues: { message: string }[] }).issues
        .map((i) => i.message)
        .join(", ")
    );
  }

  console.error("Unhandled error:", err);
  return errorResponse("INTERNAL_ERROR", "An unexpected error occurred");
}
