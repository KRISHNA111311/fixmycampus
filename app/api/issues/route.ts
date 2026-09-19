import { NextResponse } from "next/server";
import { CreateIssueSchema } from "@/schemas";
import { requireUser } from "@/lib/auth";
import { createIssue, listIssues } from "@/services/issues";
import { sendAdminIssueAlert } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const rows = await listIssues({
    status: u.searchParams.get("status") ?? undefined,
    category: u.searchParams.get("category") ?? undefined,
    severity: u.searchParams.get("severity") ?? undefined,
    building: u.searchParams.get("building") ?? undefined,
    limit: Number(u.searchParams.get("limit") ?? 20)
  });
  return NextResponse.json({ issues: rows });
}

export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  
  const body = await req.json().catch(() => null);
  const parsed = CreateIssueSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  
  try {
    const issue = await createIssue(parsed.data, user);
    const rollNumber = user.email.split('@')[0].toUpperCase();

    sendAdminIssueAlert({
      issueCode: issue.issueCode, 
      title: issue.title,
      description: issue.description,
      location: issue.location.displayName, 
      building: issue.location.buildingCode,
      room: issue.location.roomNumber,
      severity: issue.severity, 
      category: issue.category, 
      department: issue.location.department,
      rollNumber: rollNumber,
      reportedAt: new Date(issue.createdAt).toISOString(),
      imageUrl: issue.images?.[0]
    }).catch(e => console.error("[email] admin alert failed:", e));

    return NextResponse.json({ issue }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 });
  }
}
