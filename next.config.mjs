/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.artic.edu' },
      { protocol: 'https', hostname: 'images.metmuseum.org' },
      { protocol: 'https', hostname: '*.wikimedia.org' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
}

export default nextConfig
