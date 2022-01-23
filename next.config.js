/** @type {import('next').NextConfig} */
const nextConfig = 
{
    reactStrictMode: true,
    rewrites: () =>
    {
        return [
            {
                source: '/d:key([a-zA-Z0-9]+)',
                destination: '/api/download?k=:key',
            },
            {
                source: '/p:key([a-zA-Z0-9]+)',
                destination: '/askpassword?k=:key',
            },
        ];
    },
}

module.exports = nextConfig
