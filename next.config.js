const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
  // Webpack only used for non-Turbopack (e.g. next build). With --turbo we skip this to avoid the warning.
  ...(process.env.TURBOPACK
    ? {}
    : {
        webpack: (config, { dev }) => {
          // Force a single React instance to avoid "Cannot read properties of null (reading 'useContext')"
          config.resolve.alias = {
            ...config.resolve.alias,
            react: path.resolve("./node_modules/react"),
            "react-dom": path.resolve("./node_modules/react-dom"),
          };
          if (dev) {
            config.watchOptions = {
              ignored: [
                "**/node_modules/**",
                "**/.git/**",
                "**/.next/**",
                path.join(config.context || "", "trace-data.sqlite*"),
              ],
              aggregateTimeout: 300,
            };
          }
          return config;
        },
      }),
};

module.exports = nextConfig;
