import path from "node:path";
import { fileURLToPath } from "node:url";

/** Directory containing this config (the `frontend/` app root). */
const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent picking up C:\Users\<you>\package-lock.json as the monorepo root.
  turbopack: {
    root: frontendRoot,
  },
};

export default nextConfig;
