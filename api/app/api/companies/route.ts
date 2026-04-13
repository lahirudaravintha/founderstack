import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { handleError, AppError } from "@/lib/errors";
import { CreateCompanyInput } from "@shared/schemas/company.schema";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new AppError("UNAUTHORIZED", "Authentication required");
    }

    // Find or check user exists
    let user = await prisma.user.findUnique({ where: { clerkId } });

    // If user doesn't exist in our DB yet, create them from Clerk data
    if (!user) {
      throw new AppError("UNAUTHORIZED", "User not found. Please wait for account setup to complete.");
    }

    // 2. Authorize — user must not already belong to a company
    if (user.companyId) {
      throw new AppError("FORBIDDEN", "You already belong to a company");
    }

    // 3. Validate input
    const body = await request.json();
    const data = CreateCompanyInput.parse(body);

    // 4. Execute — create company and set user as owner
    const company = await prisma.$transaction(async (tx) => {
      const newCompany = await tx.company.create({
        data: {
          name: data.name,
          industry: data.industry,
          foundedDate: data.foundedDate ? new Date(data.foundedDate) : null,
          currency: data.currency,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          companyId: newCompany.id,
          role: "owner",
        },
      });

      return newCompany;
    });

    // 5. Respond
    return NextResponse.json(company, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
