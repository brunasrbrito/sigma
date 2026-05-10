import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const res = await fetch(`${process.env.API_URL}/stock/products`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
