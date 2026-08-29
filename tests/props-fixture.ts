// One authorized-snapshot fixture, shaped exactly as the host builds it for a
// picture, so every suite pins the same props shape and a field the host
// stopped sending fails in one place.
//
// A PICTURE'S CONTENT DOES NOT TRAVEL ON THE TEXT CHANNEL. The versioned server
// content channel carries text, configuration and page projections; an image is
// none of those, so the host's projection for one is the named absence
// `unsupported-form`. The bytes reach the page as a SUBRESOURCE LOAD from the
// host-authorized address on the snapshot — which is exactly what makes the
// picture paint inside a third-party application, where the island seals that
// address to the one gate, artifact and revision the gate pinned.

import type { ArtifactContentProjection } from "../src/artifact-content-channel";
import type { ArtifactRendererProps } from "../src/artifact-renderer-props";

/** The first-party byte address the artifact page and the review card carry. */
export const FIRST_PARTY_PREVIEW = "/api/artifacts/art_pic/versions/rev_pic/preview";
/** The island byte route and the query parameter it reads its capability from —
 * the address a host builds into a snapshot it hands a display inside a
 * third-party application. The route serves it as a subresource and refuses
 * every navigation, which is why a display paints it and never links it. */
export const ISLAND_BYTE_ADDRESS =
  "/api/lifecycle-views/artifact-bytes?bc=sealed-capability-for-this-gate";

/** What the channel says about a picture: there is no text projection of one. */
export function pictureContent(
  revisionId: string | null = "rev_pic",
): ArtifactContentProjection {
  return {
    kind: "none",
    channelVersion: 1,
    representationRevisionId: revisionId,
    reason: "unsupported-form",
  };
}

export function props(overrides: Partial<ArtifactRendererProps> = {}): ArtifactRendererProps {
  return {
    propsApiVersion: 1,
    artifact: {
      id: "art_pic",
      title: "Why brand voice travels — featured image",
      objectType: "@cinatra-ai/blog-image-artifact:blog-image",
      mime: "image/png",
      size: 148_221,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      ownerLevel: "workspace",
      visibility: "organization",
      sourceUrl: null,
    },
    representation: { revisionId: "rev_pic", mime: "image/png" },
    urls: { preview: FIRST_PARTY_PREVIEW, download: "/api/artifacts/art_pic/versions/rev_pic/content" },
    identity: { kind: "extension", extension: "@cinatra-ai/blog-image-artifact" },
    actions: { download: "/api/artifacts/art_pic/versions/rev_pic/content", openInSource: null },
    content: pictureContent(),
    ...overrides,
  };
}

/** The same snapshot as a host builds it INSIDE A THIRD-PARTY APPLICATION: the
 * byte address is the island-scoped one, sealed to the gate that pinned this
 * revision. */
export function islandProps(overrides: Partial<ArtifactRendererProps> = {}): ArtifactRendererProps {
  return props({
    urls: { preview: ISLAND_BYTE_ADDRESS, download: ISLAND_BYTE_ADDRESS },
    actions: { download: ISLAND_BYTE_ADDRESS, openInSource: null },
    ...overrides,
  });
}
