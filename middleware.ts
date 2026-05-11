import { type NextRequest, NextResponse } from 'next/server';
import { rootDomain } from '@/lib/utils';

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Ambiente de desenvolvimento local
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }
    return null;
  }

  // Ambiente de produção
  const rootDomainFormatted = rootDomain.split(':')[0];

  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1. LISTA DE ROTAS DO SISTEMA (PÁGINAS GLOBAIS) ---
  // AQUI ESTÁ A MÁGICA: Adicionamos o '/admin' para que o middleware ignore a verificação de subdomínio nele
  const systemRoutes = ['/admin', '/checkout', '/cart', '/login', '/api', '/_next'];
  const isSystemRoute = systemRoutes.some(route => pathname.startsWith(route));

  // Se for uma rota do sistema (como o admin), deixa passar direto sem olhar subdomínio
  if (isSystemRoute) {
    return NextResponse.next();
  }

  const subdomain = extractSubdomain(request);

  if (subdomain) {
    // Bloqueia acesso ao admin via subdomínio (já estava aqui por segurança)
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Se estiver no subdomínio e na home, faz o rewrite para a página do tenant
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
    }
    
    // Se estiver em outra página dentro do subdomínio (ex: /produto/123), 
    // você também pode precisar de um rewrite aqui dependendo da sua estrutura.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|[\\w-]+\\.\\w+).*)'
  ]
};