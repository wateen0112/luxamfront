import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("luxamToken");

  if (token) {
    // إذا كان المستخدم مسجل الدخول وتم طلب الصفحة الرئيسية، يتم إعادة التوجيه إلى صفحة /admin/hero
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  } else {
    // إذا لم يكن المستخدم مسجل الدخول وتم طلب صفحات الإدارة، يتم إعادة التوجيه إلى الصفحة الرئيسية
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/"], 
};
