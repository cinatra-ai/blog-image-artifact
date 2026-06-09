# Technology Stack

**Analysis Date:** 2026-06-09

## Languages

**Primary:**
- TypeScript (ES2023 target) - `src/index.ts` (sole source file, exports manifest)

**Secondary:**
- Not applicable

## Runtime

**Environment:**
- Node.js 24 (pinned in CI via `actions/setup-node@v4` with `node-version: "24"`)

**Package Manager:**
- pnpm (via corepack) — `corepack enable` + `corepack pnpm install`
- Lockfile: not committed (CI uses `--no-frozen-lockfile`)

## Frameworks

**Core:**
- None — this is a Cinatra platform artifact extension (content + manifest only)

**Testing:**
- Not applicable (no test files present; tests run via the parent cinatra monorepo)

**Build/Dev:**
- TypeScript compiler (`tsc`) — `tsconfig.json`
  - Target: ES2023, module: ESNext, moduleResolution: bundler
  - Outputs to `dist/`, with declaration maps and source maps

## Key Dependencies

**Critical:**
- `@cinatra-ai/sdk-extensions` (optional peer `*`) — provides the `SemanticArtifactManifest` type imported in `src/index.ts`. Resolved only by the parent cinatra monorepo, not available on a public registry.

**Infrastructure:**
- No runtime or dev dependencies declared beyond the optional peer above.

## Configuration

**Environment:**
- No `.env` files required — this package has no runtime secrets or environment variables.
- `.npmrc` present — note existence only; not read.

**Build:**
- `tsconfig.json` — standalone strict config (not extending a monorepo base); targets `src/`, emits to `dist/`

**Package manifest:**
- `package.json` — includes a `cinatra` extension block declaring:
  - `apiVersion: cinatra.ai/v1`
  - `kind: artifact`
  - Accepted MIME types: `image/png`, `image/jpeg`, `image/webp`
  - Matcher skill: `@cinatra-ai/blog-image-artifact:blog-image-matcher`
  - `matcherConfidenceThreshold: 0.7`

## Platform Requirements

**Development:**
- Node.js 24+, pnpm (via corepack)
- This repo is a **source mirror** of a cinatra monorepo extension; standalone install/typecheck/test are skipped in CI because `@cinatra-ai/sdk-extensions` is a host-internal peer not published to any registry.

**Production:**
- Published to `registry.cinatra.ai` (Cinatra Marketplace) via a GitHub Release + marketplace MCP proxy pipeline (`release.yml`)
- NOT published to npm or Verdaccio directly

---

*Stack analysis: 2026-06-09*
