import { defineConfig } from "vitest/config";

// jsdom and the automatic JSX runtime (matching the tsconfig `jsx: "react-jsx"`)
// stay the suite defaults. This package carries no display of its own, so no
// suite mounts one.
//
// NO SANITIZER ALIAS HERE: this package renders no markup from content, so it
// reaches no sanitizer and carries none.
export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**"],
  },
});
