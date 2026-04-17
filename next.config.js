/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard/gratificacoes/:path*',
        destination: 'https://bravo.lojabigben.com/rh/gratificacoes/emitir/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/historico/:path*',
        destination: 'https://bravo.lojabigben.com/rh/gratificacoes/historico/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/admin/:path*',
        destination: 'https://bravo.lojabigben.com/rh/gratificacoes/admin/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/funcionarios/:path*',
        destination: 'https://bravo.lojabigben.com/funcionarios',
        permanent: true,
      },
      {
        source: '/dashboard/:path*',
        destination: 'https://bravo.lojabigben.com/rh/gratificacoes',
        permanent: true,
      },
      {
        source: '/login',
        destination: 'https://bravo.lojabigben.com/rh/gratificacoes/login',
        permanent: true,
      },
      {
        source: '/',
        destination: 'https://bravo.lojabigben.com/rh/gratificacoes',
        permanent: true,
      },
    ]
  },
}
module.exports = nextConfig
