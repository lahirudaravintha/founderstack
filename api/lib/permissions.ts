import type { User, ModuleAccess } from "@/generated/prisma/client";
import type { ModulePermission } from "@shared/types/user";
import { isRoleAtLeast } from "@shared/constants/roles";
import type { Role } from "@shared/types/user";
import { AppError } from "./errors";

export function requireRole(user: User, requiredRole: Role): void {
  if (!isRoleAtLeast(user.role as Role, requiredRole)) {
    throw new AppError("FORBIDDEN", `This action requires the "${requiredRole}" role or higher`);
  }
}

export function requireModuleAccess(
  user: User & { moduleAccess: ModuleAccess[] },
  moduleId: string,
  requiredPermission: ModulePermission
): void {
  // Owners and admins have full access to all modules
  if (isRoleAtLeast(user.role as Role, "admin")) {
    return;
  }

  const access = user.moduleAccess.find((ma) => ma.moduleId === moduleId);

  if (!access) {
    throw new AppError("FORBIDDEN", `You do not have access to the "${moduleId}" module`);
  }

  if (requiredPermission === "write" && access.permission === "read") {
    throw new AppError("FORBIDDEN", `You have read-only access to the "${moduleId}" module`);
  }
}
