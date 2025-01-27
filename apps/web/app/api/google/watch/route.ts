import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { getGmailClient } from "@/utils/gmail/client";
import { watchEmails } from "./controller";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user.email)
    return NextResponse.json({ error: "Not authenticated" });

  const gmail = getGmailClient(session);

  const expirationDate = await watchEmails(session.user.id, gmail);
  if (expirationDate) {
    return NextResponse.json({ expirationDate });
  } else {
    console.error("Error watching inbox");
    return NextResponse.json({ error: "Error watching inbox" });
  }
}
