// The versioned, normalized, SERIALIZABLE props snapshot a Cinatra
// extension-shipped artifact renderer receives from the host.
//
// A v1 renderer requests NO host ports — it renders ONLY from this
// host-supplied authorized snapshot. Every field is plain JSON data: row
// metadata, the resolved representation, host-authorized URLs, and sanctioned
// action handles as navigational hrefs (never closures / host context). The
// host access-checks each URL BEFORE building this snapshot; the renderer just
// references them.
//
// THE SOURCE OF TRUTH IS THE SDK LEAF `@cinatra-ai/sdk-extensions/artifact-renderer-props`.
// This module is a LOCAL STRUCTURAL COPY of that leaf, declared here — and not
// imported — for one reason only: the SDK is not resolvable from a standalone
// extension repository, so importing it would break this package's own install
// and typecheck. The copy is therefore kept EXACTLY equal to the leaf: the same
// fields, and the same string unions spelled out below as frozen runtime values
// so a drift between this copy and the leaf is a test failure rather than a
// silent type lie. Replace this module with a type-only import from the leaf as
// soon as the SDK resolves from a standalone repository.
//
// The content a display draws arrives on this snapshot, through the versioned
// server content channel, read from the pinned revision on the server: see
// `./artifact-content-channel`, the local copy of that leaf beside this one.

import type { ArtifactContentProjection } from "./artifact-content-channel";

export const ARTIFACT_RENDERER_PROPS_API_VERSION = 2;

/** Why the host did not grant the edit. Named, never blank. Copied from the
 * leaf `@cinatra-ai/sdk-extensions/artifact-edit-channel` for the same single
 * reason the props copy above gives. */
export type ArtifactEditRefusal =
  | "no-write-rights"
  | "read-only-surface"
  | "unsupported-form"
  | "no-representation"
  | "content-truncated";

/**
 * THE EDIT CAPABILITY, as it arrives on a display's props: a host-minted grant
 * naming the base revision and where a change set goes, or a NAMED refusal.
 *
 * TYPES ONLY, and deliberately no road. The leaf carries the save call, its cap
 * arithmetic and its sentence tables; this display is READ-ONLY on every surface
 * it draws on, so it copies the shape the snapshot carries and none of the
 * behaviour — exactly as the content-channel copy beside it does.
 */
export type ArtifactEditCapability =
  | {
      kind: "editable";
      channelVersion: number;
      artifactId: string;
      baseRevisionId: string;
      saveUrl: string;
      idlePauseMs: number;
      capBytes: number;
    }
  | {
      kind: "read-only";
      channelVersion: number;
      reason: ArtifactEditRefusal;
    };

/** The canonical ownership-level projection, spelled out so it can be asserted. */
export const ARTIFACT_OWNER_LEVELS = ["user", "team", "organization", "workspace"] as const;
/** The canonical visibility projection, spelled out so it can be asserted. */
export const ARTIFACT_VISIBILITIES = ["private", "team", "organization", "public"] as const;
/** The canonical effective-identity kinds: a type-driven identity is either an
 * installed extension or it has no primary one. */
export const EFFECTIVE_IDENTITY_KINDS = ["extension", "no-primary"] as const;

export type ArtifactOwnerLevel = (typeof ARTIFACT_OWNER_LEVELS)[number];
export type ArtifactVisibility = (typeof ARTIFACT_VISIBILITIES)[number];
export type EffectiveIdentityKind = (typeof EFFECTIVE_IDENTITY_KINDS)[number];

export interface ArtifactRendererProps {
  /** The props-contract version this snapshot conforms to. A renderer declares
   * the `propsApiVersion` it expects; the host refuses to mount a renderer whose
   * expected version this snapshot does not satisfy. */
  propsApiVersion: number;
  /** Row metadata (a projection of the authorized artifact summary). */
  artifact: {
    id: string;
    title: string | null;
    objectType: string;
    mime: string;
    size: number;
    createdAt: string;
    updatedAt: string;
    ownerLevel: ArtifactOwnerLevel;
    visibility: ArtifactVisibility;
    sourceUrl: string | null;
  };
  /** The resolved representation to serve (null when the artifact has no
   * materialized representation). */
  representation: {
    revisionId: string;
    mime: string;
  } | null;
  /** Host-authorized URLs. Already access-checked by the host — reference only. */
  urls: {
    preview: string | null;
    download: string | null;
  };
  /** The resolved effective identity, flattened to plain data: the type's
   * defining extension, or `no-primary` with a null extension. */
  identity: {
    kind: EffectiveIdentityKind;
    extension: string | null;
  };
  /** Sanctioned action handles — SERIALIZABLE navigational hrefs only. */
  actions: {
    download: string | null;
    openInSource: string | null;
  };
  /**
   * THE VERSIONED SERVER CONTENT CHANNEL: the discriminated content projection,
   * read from the PINNED revision on the server and capped there. A display
   * switches on `content.kind` and NEVER fetches; `none` is a first-class answer
   * with a named reason. This is what lets a display draw inside a third-party
   * application, where reaching for bytes from the browser paints nothing.
   */
  content: ArtifactContentProjection;
  /**
   * THE ISLAND-SCOPED BYTE REFERENCE (props v2). The address the reader may
   * actually fetch on the surface they are on: on the island a sealed,
   * short-lived capability bound to exactly this artifact and this revision,
   * and on a first-party surface the session route named as such.
   *
   * `urls` above are the host's SESSION byte routes, and a subresource load from
   * inside a third-party application carries no cookie — which is why a media
   * display painting from them draws a blank plate there.
   *
   * A DISPLAY PAINTS FROM `bytes` WHERE IT IS PRESENT and falls back to `urls`
   * where it is not, and it never fetches a host route on its own.
   *
   * ABSENT AT v1: a display that declared v1 agreed to a snapshot without it.
   */
  bytes?: {
    road: "session" | "island";
    preview: string | null;
    download: string | null;
  };
  /**
   * THE EDIT CAPABILITY: either a host-minted grant or a NAMED refusal. Every
   * surface that mounts a display says which — the artifact page mints a grant
   * for a reader with write rights, and every other surface, the review card
   * and the list row above all, mints a refusal.
   */
  edit: ArtifactEditCapability;
}
