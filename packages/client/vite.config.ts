import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  // Use relative asset paths so the same build works at "/" and "/nodaro".
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/connect": "http://localhost:4000",
      "/collections": "http://localhost:4000",
      "/documents": "http://localhost:4000",
      "/health": "http://localhost:4000",
    },
  },
  build: {
    // Output to packages/core/public so setupNodaro can serve the UI
    outDir: "../core/public",
    emptyOutDir: true,
  },
});
