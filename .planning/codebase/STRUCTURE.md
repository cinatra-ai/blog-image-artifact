# Codebase Structure

**Analysis Date:** 2026-06-09

## Directory Layout

```
blog-image-artifact/
├── src/
│   └── index.ts            # Artifact manifest export (sole TypeScript source)
├── skills/
│   └── blog-image-matcher/
│       └── SKILL.md        # LLM matcher prompt for image classification
├── .github/
│   └── workflows/
│       ├── ci.yml          # Build, typecheck, pack validation
│       └── release.yml     # Release workflow
├── package.json            # npm manifest + cinatra registry metadata
├── tsconfig.json           # Standalone TypeScript config (no monorepo extends)
├── .npmrc                  # npm/pnpm registry config
├── LICENSE                 # Apache-2.0
└── README.md               # Package documentation
```

## Directory Purposes

**`src/`:**
- Purpose: TypeScript source — the single artifact manifest export
- Contains: `index.ts` only
- Key files: `src/index.ts`

**`skills/`:**
- Purpose: Cinatra skill definitions (SKILL.md prompt documents)
- Contains: One subdirectory per skill; each contains a `SKILL.md`
- Key files: `skills/blog-image-matcher/SKILL.md`

**`.github/workflows/`:**
- Purpose: CI/CD automation
- Contains: `ci.yml` (build gate), `release.yml` (publish)
- Key files: `.github/workflows/ci.yml`

## Key File Locations

**Entry Points:**
- `src/index.ts`: Package entry — exports `blogImageArtifactManifest`

**Configuration:**
- `package.json`: npm identity, cinatra registry metadata (`cinatra.kind = "artifact"`), peer dependencies
- `tsconfig.json`: TypeScript compiler config (`target: ES2023`, `module: ESNext`, `moduleResolution: bundler`)
- `.npmrc`: Registry and package manager settings

**Core Logic:**
- `src/index.ts`: Manifest object (MIME types, skill reference, confidence threshold)
- `skills/blog-image-matcher/SKILL.md`: Classification rules and LLM output contract

**CI:**
- `.github/workflows/ci.yml`: Validates first-party dep shape, typechecks, dry-run pack, kind-specific gates

## Naming Conventions

**Files:**
- TypeScript source: `camelCase.ts` (e.g., `index.ts`)
- Skill definitions: `SKILL.md` (uppercase, fixed name per Cinatra convention)
- Workflows: `kebab-case.yml`

**Directories:**
- Skills: `kebab-case` matching the skill name (e.g., `blog-image-matcher`)
- Source: `src/` (flat — no subdirectories in this minimal package)

**Exports:**
- Named exports only; one export per file: `blogImageArtifactManifest` from `src/index.ts`
- Export naming: `camelCase`, descriptive of content (artifact name + type suffix)

## Where to Add New Code

**New matcher skill:**
- Create `skills/<skill-name>/SKILL.md` following the frontmatter + classification rules + JSON output contract pattern of `skills/blog-image-matcher/SKILL.md`
- Register the skill reference in `src/index.ts` under `skills.matchers`
- Update `package.json` `cinatra.artifact.skills.matchers` array to match

**New exported type or constant:**
- Add to `src/index.ts` (this is the sole module; keep it flat unless the package grows significantly)

**New configuration:**
- Build/compiler changes: `tsconfig.json`
- Package identity or Cinatra metadata: `package.json` under the `cinatra` key

## Special Directories

**`skills/`:**
- Purpose: Cinatra skill prompt documents consumed by the skill runner at runtime
- Generated: No — hand-authored
- Committed: Yes

**`dist/`:**
- Purpose: TypeScript compilation output (`outDir` in `tsconfig.json`)
- Generated: Yes (by `tsc`)
- Committed: No (not present in repo; generated during build)

**`.planning/`:**
- Purpose: GSD planning artifacts (architecture docs, phase plans)
- Generated: Yes (by GSD tooling)
- Committed: Per project convention

---

*Structure analysis: 2026-06-09*
