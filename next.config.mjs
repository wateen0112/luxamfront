/** @type {import('next').NextConfig} */
const nextConfig = {
 

    output: 'standalone', // Enable static export
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*",
            },
        ],
    },
};

export default nextConfig;
