# Testing Patterns

**Analysis Date:** 2026-06-09

## Test Framework

**Runner:**
- Not detected — no test framework is configured in this repo
- No `jest.config.*`, `vitest.config.*`, or equivalent found
- No `test` script in `package.json`

**Assertion Library:**
- Not applicable

**Run Commands:**
```bash
# No test commands defined in package.json
# CI skips tests for this repo (source mirror with host-internal peers):
# "Skipping standalone tests (host-internal @cinatra-ai/* peers — the cinatra monorepo runs these)."
```

## Why Tests Are Absent

This repository is a **Cinatra source mirror** (a `cinatra.kind: artifact` extension repo extracted from the monorepo). As documented in `.github/workflows/ci.yml`, repos that declare `@cinatra-ai/*` optional peers cannot run tests standalone because those packages are not published to any registry — they resolve only inside the Cinatra monorepo workspace. The monorepo owns test execution for this repo.

## CI Validation Gates (substitute for standalone tests)

Although no unit/integration tests run in this repo standalone, CI enforces the following quality gates via `.github/workflows/ci.yml`:

**1. Dependency-shape gate (`build` job — "Classify repo + validate first-party dep shape"):**
- Fails with exit 2 if any `@cinatra-ai/*` or `@cinatra/*` package appears in `dependencies`, `devDependencies`, or `optionalDependencies`
- Fails if a first-party peer is missing `peerDependenciesMeta.<pkg>.optional: true`
- Implemented as an inline `node -e` script, no external tooling required

**2. Pack dry-run gate:**
- `npm pack --dry-run` validates package shape and publish payload
- Catches missing files, bad `main`/`types` fields, malformed `package.json`

**3. Kind-specific gate (`kind-gates` job):**
- Runs after `build`; for `artifact` kind, no additional gate is applied today
- Placeholder step documents the contract for future gate additions

## Test File Organization

**Location:**
- Not applicable — no test files exist in this repository

**Naming:**
- Not applicable

## Mocking

**Framework:** Not applicable

**Patterns:** Not applicable

## Fixtures and Factories

**Test Data:** Not applicable

## Coverage

**Requirements:** None enforced in this repo (delegated to monorepo)

## Test Types

**Unit Tests:** Not present in this repo; run in the Cinatra monorepo

**Integration Tests:** Not present

**E2E Tests:** Not applicable

## Guidance for Adding Tests

If this repo is ever decoupled from the monorepo (i.e., `@cinatra-ai/sdk-extensions` becomes a published package), the recommended testing approach based on codebase conventions would be:

- **Framework:** Vitest (aligns with ESM + `"type": "module"` and modern TypeScript toolchains)
- **Location:** Co-located `src/index.test.ts` or a top-level `tests/` directory
- **Scope:** Validate that `blogImageArtifactManifest` matches the shape declared in `package.json`'s `cinatra` block; validate MIME type list; validate `matcherConfidenceThreshold`
- **Add `test` script** to `package.json` so `pnpm test --if-present` (used in CI) picks it up automatically

---

*Testing analysis: 2026-06-09*
