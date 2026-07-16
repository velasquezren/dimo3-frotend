import type { NextConfig } from "next";

let backendUrl = process.env.BACKEND_URL ?? "http://localhost:5000";

// Si Azure DevOps no reemplaza la variable, evitará que se rompa la compilación
if (!backendUrl || backendUrl.startsWith("$(")) {
  backendUrl = "http://localhost:5000";
}

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
