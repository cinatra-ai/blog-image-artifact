import { defineConfig } from "vitest/config";

// The suites read the manifest and the contract copies; none mounts a display,
// because this package carries no display of its own.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**"],
  },
});
