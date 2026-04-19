import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("API_URL:", process.env.API_URL); // ← log temporário
  const res = await fetch(`${process.env.API_URL}/products`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${process.env.API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") || "",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
