# Blog Image

A hero or inline illustration produced for a blog article. Blog Images are "article art" — composed, brand-consistent, and deliberately illustrative — kept distinct from screenshots, logos, and charts so editorial image searches surface only real article illustrations.

The artifact accepts PNG, JPEG, and WebP files. Its canonical producer is the blog generation pipeline's image step, which calls `createSemanticArtifact` and `assertSemanticType({ assertedBy: "agent" })` to bypass the bytes matcher and write directly to the artifact store.

**Purpose.** Holds exactly one editorial illustration per blog post — hero banner or inline conceptual render — so the image library never contains stray screenshots or stock photos.

**Install.** Install this artifact from the marketplace. No credentials or connector configuration are required.

**Usage.** Reference a blog-image artifact from the WordPress Publish agent or LinkedIn Publish agent to attach the image when publishing. To reclassify an image from the library, open the asset and choose Reclassify; the matcher accepts it when confidence is at or above 0.7.

**Configuration.** No configuration keys are required. The matcher confidence threshold (0.7) is declared in the artifact manifest and is not user-adjustable.

**API contract.** Accepted MIME types: `image/png`, `image/jpeg`, `image/webp`. Matcher output: `{ "matches": boolean, "confidence": number 0–1, "rationale": string }`. Agent-asserted materialization bypasses the bytes matcher entirely.

**Development.** Run `node extension-kind-gate.mjs` to validate the manifest and README before publishing. Source entry: `src/index.ts`; matcher prompt: `skills/blog-image-matcher/SKILL.md`.

**Troubleshooting.** Images rejected by the matcher (confidence below 0.7) are likely screenshots, stock photos, charts, or logos. Only purpose-made editorial illustrations — hero banners with deliberate composition, conceptual renders, AI-generated article art — reach the threshold. Re-generate via the blog pipeline rather than uploading an arbitrary file.

## Works with

- Blog Pipeline agent
- Blog Image Prompt agent
- WordPress Publish agent
- LinkedIn Publish agent

## Capabilities

- Hold the hero or inline illustration for a generated blog post
- Surface only editorial illustrations in the library, never stray UI captures
- Pass the article art into downstream publishing agents
- Preview, download, or reclassify an image from the library
