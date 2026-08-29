import { defineConfig } from "vitest/config";

// jsdom so the display entries can be MOUNTED in a real DOM — the picture is
// drawn as a subresource load, and only a real element carries one. The
// automatic JSX runtime matches the tsconfig `jsx: "react-jsx"`.
//
// NO SANITIZER ALIAS HERE, unlike the fleet's text displays: this package draws
// bytes through a host-authorized address and renders no markup from content,
// so it reaches no sanitizer and carries none.
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
