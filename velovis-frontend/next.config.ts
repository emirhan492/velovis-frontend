import type { NextConfig } from 'next'

// nextConfig objesini tanımlıyoruz
const nextConfig: NextConfig = {
  // reactStrictMode: true, // (Bu satır sende olabilir veya olmayabilir, Next.js'in varsayılanıdır)

  // Dışarıdan yüklenecek resimlerin adreslerini buraya ekliyoruz
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**', // 'via.placeholder.com' adresindeki tüm yollara izin ver
      },
      // Gelecekte bir resim sunucun (S3, Cloudinary vb.) olursa,
      // onun bilgilerini de buraya yeni bir obje olarak ekleyeceksin.
    ],
  },
}

// Config'i dışarı aktarıyoruz
export default nextConfig