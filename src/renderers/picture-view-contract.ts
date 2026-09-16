// THE VIEW CONTRACT — what this display can be showing, and what it says when it
// is showing nothing.
//
// A PICTURE IS PAINTED, NEVER PARSED. This package renders no markup from stored
// content and reaches no sanitizer: the only thing it puts in the page is a
// host-authorized address on an image element. So this contract carries no
// document class at all — a picture, or a named floor.

import type { ArtifactRendererProps } from "../artifact-renderer-props";

/** The props-contract version this display declares, and the only one it accepts
 * a snapshot at. The manifest entries declare the same number, and the host
 * resolves the display and builds the snapshot at it.
 *
 * IT FOLLOWS THE SDK'S CURRENT VERSION, which is 2
 * (`ARTIFACT_RENDERER_PROPS_API_VERSION` in
 * `@cinatra-ai/sdk-extensions/artifact-renderer-props`: "IT IS 2 SINCE WAVE 3
 * of `PLAN: Agents Lifecycle (D) - Review`"). Declaring 1 was not a smaller
 * agreement, it was a different one: the host narrows a snapshot to the version
 * a display negotiated ONLY where the surface passes it through that seam, and
 * the row surface hands the display the snapshot it built at its own ceiling.
 * A display that read only 1 therefore floored on a live, readable artifact in
 * the row while the same artifact drew on its own page. */
export const PICTURE_DISPLAY_PROPS_API_VERSION = 2;

/** The picture forms this extension accepts, and the only ones it will draw. */
export const PICTURE_FORMS = ["image/png", "image/jpeg", "image/webp"] as const;

export type PictureFloorReason =
  | "malformed-props"
  | "props-version"
  | "no-pinned-revision"
  | "content-revision-mismatch"
  | "not-a-picture"
  | "no-authorized-address";

export type PictureView =
  | {
      kind: "picture";
      /** The host-authorized address the picture is painted from. First-party on
       * the artifact page and the review card; the island's sealed address
       * inside a third-party application. Painted verbatim, never altered. */
      src: string;
      /** The pinned revision this picture belongs to. */
      revisionId: string;
      form: string;
      /** What a reader hears in place of the picture. */
      alt: string;
    }
  | { kind: "floor"; reason: PictureFloorReason };

const FLOOR_MESSAGES: Record<PictureFloorReason, string> = {
  "malformed-props": "This picture cannot be drawn: the view was opened without a picture to show.",
  "props-version": "This picture cannot be drawn: it was handed a view of a version this display does not read.",
  "no-pinned-revision": "There is no stored version of this picture to show.",
  "content-revision-mismatch": "This picture cannot be drawn: the picture handed to this view belongs to a different revision than the one being viewed.",
  "not-a-picture": "This artifact does not hold a picture in a form this display draws.",
  "no-authorized-address": "This picture cannot be shown here: no address for it was authorized for this view.",
};

/** A display must never throw on a shape it did not expect, so the input is
 * accepted loosely and every surprise lands on the floor. */
export type PictureRendererInput = Partial<ArtifactRendererProps> | null | undefined;

/** The sentence a reader sees for a floor. One per reason, all distinct. */
export function pictureFloorMessage(reason: PictureFloorReason): string {
  return FLOOR_MESSAGES[reason] ?? FLOOR_MESSAGES["malformed-props"];
}
