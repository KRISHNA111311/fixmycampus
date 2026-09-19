import { NextResponse } from "next/server";
import { getIssueById } from "@/services/issues";
export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const issue = await getIssueById(params.id);
  if (!issue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ issue });
}