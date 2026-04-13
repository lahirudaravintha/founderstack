import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";

const UpdateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().optional(),
  currency: z.string().optional(),
}).strict();

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireAuthWithCompany();
    requireRole(user, "admin");

    // Verify the company ID matches the user's company
    if (id !== user.companyId) {
      throw new AppError("FORBIDDEN", "You can only update your own company");
    }

    const body = await request.json();
    const data = UpdateCompanySchema.parse(body);

    const company = await prisma.company.update({
      where: { id },
      data,
    });

    return NextResponse.json(company);
  } catch (err) {
    return handleError(err);
  }
}
