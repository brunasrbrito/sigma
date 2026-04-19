import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logout realizado' });

  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');

  return response;
}
