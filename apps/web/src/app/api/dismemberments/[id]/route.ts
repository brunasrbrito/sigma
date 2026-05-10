import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const res = await fetch(`${process.env.API_URL}/dismemberments/${id}`, {
    method: "DELETE",
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
