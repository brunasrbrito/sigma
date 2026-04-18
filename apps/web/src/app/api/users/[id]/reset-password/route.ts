import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/reset-password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
