import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.integration.test.ts"],
    // Separate processes so mongoose connection state does not leak between files.
    pool: "forks",
    hookTimeout: 120_000,
    testTimeout: 120_000,
  },
});
