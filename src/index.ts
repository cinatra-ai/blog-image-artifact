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
//
// EXPLICIT TYPE DECLARATION (ratified entry 95, epic cinatra#1785). This pack
// DECLARES the one object type it owns — `blog-image` — in `objectTypes`
// rather than relying on the retired `<package>:artifact` umbrella derivation.
// The matcher above classifies content INTO this explicitly declared type; it
// does not create it. The type is self-namespaced (this package registers it),
// so its inline schema is the permissive object shape a produced image row
// carries; `dispositions.projection: "artifact-safe"` keeps context projection
// to metadata (never the raw bytes). No `mode` field (not in the schema).
export const blogImageArtifactManifest: SemanticArtifactManifest = {
  accepts: {
    file: {
      mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    },
  },
  skills: {
    matchers: ["@cinatra-ai/blog-image-matcher-skill:blog-image-matcher"],
  },
  matcherConfidenceThreshold: 0.7,
  objectTypes: [
    {
      type: "@cinatra-ai/blog-image-artifact:blog-image",
      claim: "dedicated",
      dispositions: {
        projection: "artifact-safe",
        pinnable: false,
        snapshotPolicy: "none",
        sensitivity: "normal",
      },
      // THE TWO FIELDS THIS TYPE DECLARES (§8.2 of the lifecycle plan): the post
      // the picture belongs to, and where it sits on that post. The type declared
      // neither before — a bare object with no properties at all — so nothing about
      // a picture said which post it was made for.
      //
      // THE PLACEMENT HAS ONE VALUE. The pipeline makes one picture, the featured
      // image; there are no body pictures. A schema that admitted a body placement
      // would declare data the pipeline is ruled never to make.
      schema: {
        "type": "object",
        "properties": {
          "post": {
            "type": "string"
          },
          "placement": {
            "type": "string",
            "enum": [
              "featured"
            ]
          }
        },
        "required": [
          "post",
          "placement"
        ],
        "additionalProperties": true
      },
    },
  ],

  // THE DISPLAYS THIS EXTENSION SHIPS, declared for its OWN type and published
  // through this package's own `exports` at the key the host's manifest
  // generator derives from each entry. Mirrors the `cinatra` block in
  // package.json, which is the manifest of record; the manifest test keeps the
  // two in agreement.
  ui: {
    "abiVersion": 1,
    "sdkAbiRange": "^2.5.0",
    "renderers": {
      "detail": {
        "entry": "./src/renderers/detail.tsx",
        "propsApiVersion": 1,
        "representations": [
          "image/png",
          "image/jpeg",
          "image/webp"
        ]
      },
      "preview": {
        "entry": "./src/renderers/preview.tsx",
        "propsApiVersion": 1,
        "representations": [
          "image/png",
          "image/jpeg",
          "image/webp"
        ]
      },
      "listRow": {
        "entry": "./src/renderers/list-row.tsx",
        "propsApiVersion": 1,
        "representations": [
          "image/png",
          "image/jpeg",
          "image/webp"
        ]
      }
    }
  },
};

export {
  type ArtifactRendererProps,
  ARTIFACT_RENDERER_PROPS_API_VERSION,
} from "./artifact-renderer-props";

export {
  type ArtifactContentProjection,
  type ArtifactContentAbsence,
  type ArtifactContentClass,
  ARTIFACT_CONTENT_CHANNEL_VERSION,
} from "./artifact-content-channel";

// TYPES ONLY, from the module that reaches nothing. The displays themselves are
// imported at their own published subpaths.
export type { PictureView, PictureFloorReason } from "./renderers/picture-view-contract";
