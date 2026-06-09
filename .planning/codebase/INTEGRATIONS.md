# External Integrations

**Analysis Date:** 2026-06-09

## APIs & External Services

**Cinatra Platform:**
- Cinatra Marketplace (`registry.cinatra.ai`) — artifact is published here on GitHub Release via the reusable workflow `cinatra-ai/.github/.github/workflows/reusable-extension-release.yml@main`
  - Auth: `CINATRA_MARKETPLACE_VENDOR_TOKEN` org secret (inherited in `release.yml`)
- Cinatra Monorepo — provides `@cinatra-ai/sdk-extensions` (host-internal, not on any public registry); the parent monorepo clones this repo into its workspace and resolves/typechecks/tests the package.

**Downstream Agents (consumers documented in README.md):**
- Blog Pipeline agent — canonical producer of blog images; materializes this artifact via `createSemanticArtifact` + `assertSemanticType({ assertedBy: "agent" })`
- Blog Image Prompt agent — upstream generator
- WordPress Publish agent — downstream consumer
- LinkedIn Publish agent — downstream consumer

## Data Storage

**Databases:**
- Not applicable — this package is a metadata/manifest artifact with no database access.

**File Storage:**
- Not applicable — image bytes are handled by the Cinatra platform file layer; this package only declares accepted MIME types (`image/png`, `image/jpeg`, `image/webp`).

**Caching:**
- Not applicable

## Authentication & Identity

**Auth Provider:**
- Not applicable at the package level. Release publishing uses the `CINATRA_MARKETPLACE_VENDOR_TOKEN` GitHub org secret (see `release.yml`). No runtime auth logic exists in this package.

## Monitoring & Observability

**Error Tracking:**
- Not applicable

**Logs:**
- Not applicable (no runtime code beyond a static TypeScript export)

## CI/CD & Deployment

**Hosting:**
- Cinatra Marketplace (`registry.cinatra.ai`) — extension registry, NOT npm/Verdaccio

**CI Pipeline:**
- GitHub Actions
  - `.github/workflows/ci.yml` — runs on push/PR to `main`; jobs: `build` (classify repo, conditional install/typecheck/test, `npm pack --dry-run`) and `kind-gates` (no extra gate for `artifact` kind)
  - `.github/workflows/release.yml` — triggers on GitHub Release published or `workflow_dispatch`; delegates entirely to the cinatra-ai org reusable release workflow; requires `id-token: write` and `attestations: write` permissions for build-provenance attestation

## Environment Configuration

**Required env vars:**
- None for local development or runtime use.
- `CINATRA_MARKETPLACE_VENDOR_TOKEN` — required only during the GitHub Actions release job (org secret, never stored locally).

**Secrets location:**
- GitHub org-level secrets (not in this repo)

## Webhooks & Callbacks

**Incoming:**
- Not applicable

**Outgoing:**
- Not applicable

---

*Integration audit: 2026-06-09*
