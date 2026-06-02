import type { SemanticArtifactManifest } from "@cinatra-ai/sdk-extensions";

// `@cinatra-ai/blog-image-artifact` is the canonical record for blog post
// hero / inline illustration images.
//
// AGENT-ONLY MATCHER POLICY. This artifact is materialized by the
// in-pipeline image-bytes producer (`blog_image_generate_*` /
// generateBlogImage…) via `createSemanticArtifact` +
// `assertSemanticType({ assertedBy: "agent" })`. The bytes matcher
// below exists for registry/visibility completeness and to keep
// user-driven reclassification working in the library renderer, but
// it is deliberately STRICT: it returns `matches:false` for arbitrary
// user-uploaded photos/screenshots/diagrams — only pipeline-shaped blog
// illustration imagery clears the 0.7 floor. The SemanticArtifactManifest
// schema is `.strict()` (no `agentOnly` field), so the policy is
// realized by (a) the agent-asserted materializer being the canonical
// producer and (b) this strict matcher, NOT a schema flag.
//
// MIME scope: image/png, image/jpeg, image/webp (the multimodal-readable
// raster set; SVG/GIF excluded — SVG is markup, animated GIF framing is
// not reliably classifiable from a single representation).
export const blogImageArtifactManifest: SemanticArtifactManifest = {
  accepts: {
    file: {
      mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    },
  },
  skills: {
    matchers: ["@cinatra-ai/blog-image-artifact:blog-image-matcher"],
  },
  matcherConfidenceThreshold: 0.7,
};
