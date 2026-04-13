import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { InviteUserInput } from "@shared/schemas/user.schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const user = await requireAuthWithCompany();
    requireRole(user, "admin");

    const invitations = await prisma.invitation.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invitations);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthWithCompany();
    requireRole(user, "admin");

    const body = await request.json();
    const data = InviteUserInput.parse(body);

    if (data.role === "owner") {
      throw new AppError("VALIDATION_ERROR", "Cannot invite someone as owner");
    }

    // Check if already invited
    const existing = await prisma.invitation.findFirst({
      where: {
        companyId: user.companyId,
        email: data.email,
        status: "pending",
      },
    });

    if (existing) {
      throw new AppError("VALIDATION_ERROR", "An invitation is already pending for this email");
    }

    // Check if user already belongs to this company
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        companyId: user.companyId,
      },
    });

    if (existingUser) {
      throw new AppError("VALIDATION_ERROR", "This user is already a member of your company");
    }

    // Get company name for the email
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
    });

    // Create invitation in DB
    const invitation = await prisma.invitation.create({
      data: {
        companyId: user.companyId,
        invitedByUserId: user.id,
        email: data.email,
        role: data.role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Send invitation email via Resend
    const baseSignUpUrl = process.env.CLERK_INVITATION_REDIRECT_URL || "https://app.founderspet.com/sign-up";
    const signUpUrl = `${baseSignUpUrl}?email=${encodeURIComponent(data.email)}&token=${invitation.token}`;
    const inviterName = `${user.firstName} ${user.lastName}`.trim() || user.email;

    try {
      await resend.emails.send({
        from: "FounderStack <noreply@founderspet.com>",
        to: data.email,
        subject: `${inviterName} invited you to join ${company?.name || "their company"} on FounderStack`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="width: 48px; height: 48px; background: #16a34a; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="color: white; font-weight: bold; font-size: 18px;">FS</span>
              </div>
              <h1 style="font-size: 24px; font-weight: 700; color: #111; margin: 0;">You're invited!</h1>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              <strong>${inviterName}</strong> has invited you to join
              <strong>${company?.name || "their company"}</strong> on FounderStack as a <strong>${data.role}</strong>.
            </p>
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              FounderStack helps startup founders track capital contributions, expenses, and manage their company finances.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${signUpUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
            <p style="font-size: 12px; color: #999; text-align: center;">
              This invitation expires in 7 days. If you didn't expect this, you can ignore this email.
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send invitation email:", emailErr);
      // Don't fail the request — invitation is saved, email just didn't send
    }

    return NextResponse.json(invitation, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
