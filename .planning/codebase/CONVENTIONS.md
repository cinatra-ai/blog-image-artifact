# Coding Conventions

**Analysis Date:** 2026-06-09

## Naming Patterns

**Files:**
- `kebab-case` for filenames: `src/index.ts`, `skills/blog-image-matcher/SKILL.md`
- `SCREAMING_SNAKE_CASE` for documentation/contract files: `SKILL.md`, `README.md`

**Variables / Exports:**
- `camelCase` for exported constants: `blogImageArtifactManifest` (`src/index.ts`)
- Descriptive full names preferred over abbreviations

**Types:**
- `PascalCase` for imported types: `SemanticArtifactManifest` (`src/index.ts`)

**Packages:**
- Scoped npm packages: `@cinatra-ai/blog-image-artifact`
- Skill references use `<package>:<skill-name>` format: `@cinatra-ai/blog-image-artifact:blog-image-matcher`

## Code Style

**Formatting:**
- Tool used: Not detected (no `.prettierrc`, `.eslintrc`, or `biome.json` present)
- TypeScript `strict: true` mode enforced via `tsconfig.json`
- `noImplicitAny: false` — explicit `any` is allowed but implicit `any` is not
- `verbatimModuleSyntax: true` — type-only imports must use `import type`

**Linting:**
- No standalone linter config detected; type-checking via `tsc` serves as primary static analysis gate

## Import Organization

**Order:**
1. Type imports first using `import type` syntax (required by `verbatimModuleSyntax`)
2. Value imports follow

**Path Aliases:**
- None detected; direct relative imports used within `src/`

**Module system:**
- ESM (`"type": "module"` in `package.json`, `"module": "ESNext"` in tsconfig)
- `moduleResolution: bundler` — aligns with modern bundler resolution (not Node classic)

## Error Handling

**Patterns:**
- Not applicable at this codebase scope — `src/index.ts` exports a static manifest object with no runtime logic or error paths
- Skill classifier (`skills/blog-image-matcher/SKILL.md`) handles "errors" via strict boolean `matches: false` with a `rationale` field — no exceptions thrown

## Logging

**Framework:** Not applicable — no runtime code; the single source file is a pure manifest export

**Patterns:**
- CI scripts (`ci.yml`) use `console.error()` for gate failures and `echo` for status messages
- No application-level logging

## Comments

**When to Comment:**
- Block comments document policy decisions and design intent at the module level
- Inline `//` comments used for tsconfig entries to explain non-obvious choices: `tsconfig.json` line 2
- Long explanatory comments preferred over terse stubs when architectural policy must be preserved

**JSDoc/TSDoc:**
- Not used — the single export is a typed constant; no JSDoc annotations present

## Function Design

**Size:** Not applicable — no functions defined in source; only a single exported `const` object

**Parameters:** Not applicable

**Return Values:** Not applicable

## Module Design

**Exports:**
- Named exports only: `export const blogImageArtifactManifest` (`src/index.ts`)
- No default exports detected

**Barrel Files:**
- `src/index.ts` acts as the single entry point and barrel

## Artifact / Skill Design Conventions

**Artifact manifest:**
- Defined as a typed `SemanticArtifactManifest` constant mirroring the `cinatra` key in `package.json` — single source of truth is the TypeScript export; `package.json` entry is for registry tooling
- `matcherConfidenceThreshold: 0.7` is the project-standard minimum confidence gate

**Skill prompts (`SKILL.md`):**
- Front-matter YAML block (`name`, `description`) required at top of every skill file
- Output contract specified as strict JSON with no markdown wrapper
- Positive and negative examples listed explicitly (what IS / what is NOT)
- Numerical confidence bands documented with rationale

**Dependency shape:**
- All `@cinatra-ai/*` and `@cinatra/*` packages must be declared as **optional peerDependencies** — never in `dependencies`, `devDependencies`, or `optionalDependencies`
- `peerDependenciesMeta.<pkg>.optional: true` required for every first-party peer
- Enforced by CI gate in `.github/workflows/ci.yml`

---

*Convention analysis: 2026-06-09*
