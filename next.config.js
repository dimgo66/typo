/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pizzip'],
  },
  // Увеличиваем лимит размера файлов
  serverRuntimeConfig: {
    maxFileSize: '50mb',
  },
  // Для API routes
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: '50mb',
  },
}

module.exports = nextConfig