/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost:5000'], // Include the port number
    // Alternatively, you can use remotePatterns for more control:
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;