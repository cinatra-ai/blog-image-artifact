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
//
// THE SHAPE IS THE HOST'S CURRENT ONE, NOT AN OLDER ONE THIS PACKAGE PREFERS.
// Every literal below is read off the SDK leaf
// (`packages/sdk-extensions/src/artifact-renderer-props.ts`) and off the host
// builder that stamps it (`buildArtifactRendererProps`): the version the host
// builds at, the edit capability every surface mints, and the byte reference a
// v2 snapshot carries where there is an address to carry.

import type { ArtifactContentProjection } from "../src/artifact-content-channel";
import {
  ARTIFACT_RENDERER_PROPS_API_VERSION,
  type ArtifactRendererProps,
} from "../src/artifact-renderer-props";

/** The first-party byte address the artifact page and the review card carry. */
export const FIRST_PARTY_PREVIEW = "/api/artifacts/art_pic/versions/rev_pic/preview";
/** The island byte route and the query parameter it reads its capability from —
 * the address a host builds into a snapshot it hands a display inside a
 * third-party application. The route serves it as a subresource and refuses
 * every navigation, which is why a display paints it and never links it. */
export const ISLAND_BYTE_ADDRESS =
  "/api/lifecycle-views/artifact-bytes?bc=sealed-capability-for-this-gate";

/** The first-party download address beside it. */
export const FIRST_PARTY_DOWNLOAD = "/api/artifacts/art_pic/versions/rev_pic/content";

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

/** THE REFUSAL EVERY SURFACE BUT THE ARTIFACT PAGE MINTS — `readOnlyArtifactEdit`
 * on the host side, the shape a display switches on and never infers around. */
export function readOnlyEdit(
  reason: "read-only-surface" | "no-write-rights" = "read-only-surface",
): ArtifactRendererProps["edit"] {
  return { kind: "read-only", channelVersion: 1, reason };
}

export function props(overrides: Partial<ArtifactRendererProps> = {}): ArtifactRendererProps {
  return {
    // The version the HOST builds at today, read from the contract copy rather
    // than written out here: a fixture that froze a number of its own would
    // stop being the shape the host hands a display the day the host moved.
    propsApiVersion: ARTIFACT_RENDERER_PROPS_API_VERSION,
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
    urls: { preview: FIRST_PARTY_PREVIEW, download: FIRST_PARTY_DOWNLOAD },
    identity: { kind: "extension", extension: "@cinatra-ai/blog-image-artifact" },
    actions: { download: FIRST_PARTY_DOWNLOAD, openInSource: null },
    content: pictureContent(),
    // A v2 snapshot with an address to name carries the byte reference; on a
    // first-party surface its road is the session one.
    bytes: { road: "session", preview: FIRST_PARTY_PREVIEW, download: FIRST_PARTY_DOWNLOAD },
    edit: readOnlyEdit(),
    ...overrides,
  };
}

/** The same snapshot as a host builds it INSIDE A THIRD-PARTY APPLICATION: the
 * byte address is the island-scoped one, sealed to the gate that pinned this
 * revision.
 *
 * THE TWO ADDRESSES ARE DIFFERENT HERE, AND THAT IS THE POINT. The host leaves
 * its SESSION routes on `urls` on every surface and names the address the reader
 * may actually fetch on the byte reference; on the island those are not the same
 * address, and a subresource load of the session route carries no cookie there.
 * A fixture that wrote the sealed address into both would pass whether a display
 * read the reference or ignored it, which is the one thing these suites are
 * here to tell apart. */
export function islandProps(overrides: Partial<ArtifactRendererProps> = {}): ArtifactRendererProps {
  return props({
    urls: { preview: FIRST_PARTY_PREVIEW, download: FIRST_PARTY_DOWNLOAD },
    actions: { download: ISLAND_BYTE_ADDRESS, openInSource: null },
    bytes: { road: "island", preview: ISLAND_BYTE_ADDRESS, download: ISLAND_BYTE_ADDRESS },
    ...overrides,
  });
}

/**
 * THE SNAPSHOT THE HOST HANDS A `listRow` TODAY, field for field.
 *
 * Read off the row surface's own call site (`src/components/artifacts/
 * library-row-glyph.tsx`): it loads the display at the host's CURRENT props
 * version and then builds the snapshot with `buildArtifactRendererProps`
 * WITHOUT naming a version — so the row's snapshot is stamped at the host's
 * ceiling and is never narrowed to what the display declared, which is the one
 * thing that makes the row differ from the artifact page (that surface hands
 * its snapshot through the seam that narrows it).
 *
 * And a row glyph carries no representation and no address: "A LIST GLYPH draws
 * no content by design — it has no representation either", and it mints the
 * read-only refusal because "a list row draws, it never edits".
 */
export function hostListRowProps(
  overrides: Partial<ArtifactRendererProps> = {},
): ArtifactRendererProps {
  const snapshot = props({
    representation: null,
    urls: { preview: null, download: null },
    actions: { download: null, openInSource: null },
    content: { kind: "none", channelVersion: 1, representationRevisionId: null, reason: "absent" },
    ...overrides,
  });
  // NO BYTE REFERENCE AT ALL, not an empty one: the builder defaults the session
  // road only where there is an address to default TO, and a row has neither
  // href — "absent and empty are different facts". The key is therefore deleted
  // rather than nulled, unless this caller asked for one.
  if (!("bytes" in overrides)) delete snapshot.bytes;
  return snapshot;
}
