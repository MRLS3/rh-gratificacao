import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string)                                          { return request.cookies.get(name)?.value; },
        set(name: string, value: string, opts: Record<string, unknown>) { response.cookies.set({ name, value, ...opts }); },
        remove(name: string, opts: Record<string, unknown>)            { response.cookies.set({ name, value: '', ...opts }); },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = request.nextUrl.pathname;

  // Protege rotas /dashboard e /api/usuarios
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/usuarios')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redireciona usuário logado que acessa /login
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/api/usuarios'],
};
