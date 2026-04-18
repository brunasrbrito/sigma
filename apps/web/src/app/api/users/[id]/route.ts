import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") || "",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    method: "DELETE",
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
