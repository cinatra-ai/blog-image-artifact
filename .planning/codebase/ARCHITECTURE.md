<!-- refreshed: 2026-06-09 -->
# Architecture

**Analysis Date:** 2026-06-09

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│              Cinatra Monorepo (host)                         │
│  blog generation pipeline → generateBlogImage* step         │
│  → createSemanticArtifact + assertSemanticType(agent)       │
└─────────────────────────┬───────────────────────────────────┘
                          │ produces
                          ▼
┌─────────────────────────────────────────────────────────────┐
│            @cinatra-ai/blog-image-artifact                   │
│  Semantic Artifact Manifest (agent-only policy)              │
│  `src/index.ts`                                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  blogImageArtifactManifest: SemanticArtifactManifest │   │
│  │  - accepts: image/png, image/jpeg, image/webp        │   │
│  │  - skills.matchers: blog-image-matcher               │   │
│  │  - matcherConfidenceThreshold: 0.7                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ references
                          ▼
┌─────────────────────────────────────────────────────────────┐
│            Skill: blog-image-matcher                         │
│  `skills/blog-image-matcher/SKILL.md`                        │
│  LLM prompt — classifies image bytes as blog illustration    │
│  Returns JSON: { matches, confidence, rationale }           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  @cinatra-ai/sdk-extensions (peer, monorepo-provided)        │
│  SemanticArtifactManifest type                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Artifact manifest | Declares MIME types, matcher skill reference, confidence threshold | `src/index.ts` |
| Matcher skill | LLM prompt that classifies an image as blog hero/illustration | `skills/blog-image-matcher/SKILL.md` |
| Package manifest | Cinatra registry metadata (kind=artifact, apiVersion) | `package.json` |
| CI workflow | Validates dep shape, typechecks, dry-run pack | `.github/workflows/ci.yml` |

## Pattern Overview

**Overall:** Cinatra Semantic Artifact — agent-only producer with a strict LLM-based matcher.

**Key Characteristics:**
- The canonical producer is the host monorepo's blog image pipeline step, which uses `createSemanticArtifact` + `assertSemanticType({ assertedBy: "agent" })`. This package does NOT produce artifacts itself.
- The matcher skill (`SKILL.md`) serves two purposes: registry/visibility completeness and user-driven reclassification in the library renderer.
- The manifest is strict: no `agentOnly` schema flag exists; the agent-only policy is enforced by (a) the pipeline being the only agent that asserts the type, and (b) the matcher refusing arbitrary uploaded images below the 0.7 confidence floor.
- This is a source-mirror extraction of the cinatra monorepo. `@cinatra-ai/sdk-extensions` is an optional peer dependency — it is never resolved standalone; the monorepo provides it.

## Layers

**Manifest Layer:**
- Purpose: Defines the artifact's accepted MIME types, linked matcher skill, and confidence threshold
- Location: `src/index.ts`
- Contains: A single exported constant (`blogImageArtifactManifest`) typed as `SemanticArtifactManifest`
- Depends on: `@cinatra-ai/sdk-extensions` (type import only, peer)
- Used by: Cinatra SDK registry loader, library renderer

**Skill Layer:**
- Purpose: LLM semantic classification prompt for image bytes
- Location: `skills/blog-image-matcher/SKILL.md`
- Contains: Frontmatter metadata (name, description) + natural-language classification rules + output JSON contract
- Depends on: Nothing (pure prompt document)
- Used by: Cinatra skill runner (host monorepo) when the matcher is invoked

## Data Flow

### Image Classification Path

1. Host pipeline generates blog image bytes and calls `createSemanticArtifact` + `assertSemanticType({ assertedBy: "agent" })` — artifact is recorded without invoking the matcher.
2. When the library renderer or a user-driven reclassification triggers the matcher, the Cinatra skill runner loads `skills/blog-image-matcher/SKILL.md` and sends image bytes to the LLM.
3. LLM responds with `{ "matches": <bool>, "confidence": <0..1>, "rationale": "<string>" }`.
4. The runner compares `confidence` against `matcherConfidenceThreshold: 0.7` from `src/index.ts`.
5. If `confidence >= 0.7` and `matches: true`, the artifact is confirmed as `@cinatra-ai/blog-image-artifact`.

### Confidence Bands

| Range | Interpretation |
|-------|---------------|
| 0.85–0.95 | Clear editorial blog hero/illustration |
| 0.70–0.84 | Plausible article visual, missing one editorial signal |
| 0.50–0.69 | Generic/stock image — borderline, fails threshold |
| < 0.50 | Screenshot / photo / logo / chart — rejected |

**State Management:**
- Stateless. The manifest is a plain exported object constant. No runtime state.

## Key Abstractions

**SemanticArtifactManifest:**
- Purpose: SDK type that describes which file types an artifact accepts, which matcher skill to invoke, and the minimum confidence to classify a match
- Examples: `src/index.ts` (sole implementation in this repo)
- Pattern: Plain object literal conforming to the SDK type; no classes or factories

**Skill (SKILL.md):**
- Purpose: A structured LLM prompt document consumed by the Cinatra skill runner
- Examples: `skills/blog-image-matcher/SKILL.md`
- Pattern: YAML frontmatter (name, description) + markdown body with classification rules and a mandatory JSON output contract

## Entry Points

**Package Entry Point:**
- Location: `src/index.ts`
- Triggers: Imported by the Cinatra SDK registry or any consumer that loads artifact manifests
- Responsibilities: Exports `blogImageArtifactManifest`

**Skill Entry Point:**
- Location: `skills/blog-image-matcher/SKILL.md`
- Triggers: Invoked by the Cinatra skill runner when a classification request arrives for this artifact type
- Responsibilities: Provides the LLM prompt and output contract

## Architectural Constraints

- **Agent-only producer policy:** Only the host monorepo's pipeline may assert this artifact type. The matcher enforces this implicitly by being strict about what it accepts.
- **No standalone install:** `@cinatra-ai/sdk-extensions` is monorepo-internal and never published to a registry. This repo cannot be installed or typechecked outside the monorepo context.
- **MIME scope:** Only `image/png`, `image/jpeg`, `image/webp` are accepted. SVG and animated GIF are explicitly excluded.
- **Global state:** None. The manifest is a pure exported constant.
- **Circular imports:** None (single source file).
- **Threading:** Not applicable (no runtime code).

## Anti-Patterns

### Declaring first-party deps outside peerDependencies

**What happens:** Adding `@cinatra-ai/*` to `dependencies` or `devDependencies` instead of `peerDependencies`.
**Why it's wrong:** These packages are never published to a registry; the install step would fail in CI and in any external consumer.
**Do this instead:** Declare as `peerDependencies` with `peerDependenciesMeta.<pkg>.optional: true`, as done in `package.json`.

### Using the matcher as the primary artifact producer

**What happens:** Relying on the matcher skill returning `matches:true` to assert artifact type, bypassing the pipeline's `assertSemanticType`.
**Why it's wrong:** The matcher is deliberately strict and designed to reject most user uploads. The canonical producer is the pipeline's agent assertion.
**Do this instead:** Use `createSemanticArtifact` + `assertSemanticType({ assertedBy: "agent" })` in the image generation pipeline step.

## Error Handling

**Strategy:** Not applicable — this package contains no runtime logic. The matcher skill returns `matches:false` with a low confidence score as the error/rejection signal.

**Patterns:**
- Matcher returns `{ "matches": false, "confidence": <low>, "rationale": "..." }` for non-blog images
- Confidence threshold `0.7` enforced by the SDK runtime against the manifest value

## Cross-Cutting Concerns

**Logging:** Not applicable — no runtime code.
**Validation:** Manifest shape validated by TypeScript (`strict: true` in `tsconfig.json`) and by the CI `npm pack --dry-run` step.
**Authentication:** Not applicable.

---

*Architecture analysis: 2026-06-09*
