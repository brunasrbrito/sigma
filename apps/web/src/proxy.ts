import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function tryRefresh(
  request: NextRequest,
  redirectOnFail: boolean = true,
) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) return null;

  try {
    const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.access_token as string;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/forgotPass");

  // sem nenhum token — manda pro login
  if (!token && !refreshToken && !isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // tem refresh mas não tem access — tenta renovar e continua NA MESMA PÁGINA
  if (!token && refreshToken && !isPublic) {
    const newToken = await tryRefresh(request);

    if (!newToken) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("refresh_token");
      return response;
    }

    // continua na mesma rota, só seta o novo cookie
    const response = NextResponse.next();
    response.cookies.set("access_token", newToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    return response;
  }

  // tem access token — verifica se expirou
  if (token && !isPublic) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expired = payload.exp * 1000 < Date.now();

      if (expired) {
        const newToken = await tryRefresh(request);

        if (!newToken) {
          const response = NextResponse.redirect(new URL("/", request.url));
          response.cookies.delete("access_token");
          response.cookies.delete("refresh_token");
          return response;
        }

        // continua na mesma rota, só renova o cookie
        const response = NextResponse.next();
        response.cookies.set("access_token", newToken, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/",
        });
        return response;
      }
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // logado tentando acessar página pública
  if ((token || refreshToken) && isPublic && pathname !== "/reset-password") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon|api).*)"],
};
