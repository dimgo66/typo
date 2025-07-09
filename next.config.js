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
}

module.exports = nextConfig