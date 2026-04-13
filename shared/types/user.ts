export type Role = "owner" | "admin" | "member" | "viewer";

export type ModulePermission = "read" | "write";

export type ModuleAccess = {
  id: string;
  userId: string;
  moduleId: string;
  permission: ModulePermission;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  companyId?: string;
  role: Role;
  moduleAccess: ModuleAccess[];
  createdAt: Date;
  updatedAt: Date;
};
