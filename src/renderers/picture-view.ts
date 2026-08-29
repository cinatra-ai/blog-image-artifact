// The decision leaf all three slots share: it maps the authorized snapshot to
// exactly one of two outcomes.
//
//   `picture` — the host-authorized address to paint, the pinned revision it
//     belongs to, its form, and the name a reader hears.
//   `floor` — a NAMED reason it cannot be drawn. Never blank, never a throw: a
//     display that threw would take the surface around it down with it.
//
// WHERE THE BYTES COME FROM, AND WHY IT IS AN ADDRESS AND NOT CONTENT. The
// versioned server content channel projects text, configuration and page
// content; a picture is none of those, so the channel's honest answer for one is
// the named absence `unsupported-form`, and this display does not read content
// for its picture at all. The bytes reach the page as a SUBRESOURCE LOAD from
// the address the host already access-checked and put on the snapshot — the URL
// IS the request, which is exactly why the island-scoped byte capability is a
// bearer in a URL. On the artifact page and the review card that address is the
// first-party byte route; inside a third-party application it is the island's,
// sealed to the one gate, artifact and revision the gate pinned. This display
// tells the two apart by not caring: it paints what it was given, verbatim.
//
// AND IT NEVER FETCHES, AND NEVER LINKS. A fetch carries no sealed URL and
// paints nothing inside a third-party application; a link is a navigation, and
// the island byte route refuses every navigation whatever it seals. So the one
// road out of this package is the image element the container beside this module
// draws.

import type { ArtifactRendererProps } from "../artifact-renderer-props";
import {
  PICTURE_DISPLAY_PROPS_API_VERSION,
  PICTURE_FORMS,
  type PictureFloorReason,
  type PictureRendererInput,
  type PictureView,
} from "./picture-view-contract";

export {
  PICTURE_DISPLAY_PROPS_API_VERSION,
  PICTURE_FORMS,
  pictureFloorMessage,
} from "./picture-view-contract";
export type { PictureFloorReason, PictureRendererInput, PictureView } from "./picture-view-contract";

function floor(reason: PictureFloorReason): PictureView {
  return { kind: "floor", reason };
}

/** The name a reader hears in place of the picture. A title that is absent,
 * empty or only whitespace is no name at all, so the placement says what the
 * picture is instead of leaving a reader with nothing. */
export function pictureAlt(title: string | null | undefined): string {
  return typeof title === "string" && title.trim().length > 0
    ? title.trim()
    : "The featured image for this post";
}

/** Resolve what to draw. Total: it returns a view for every input. */
export function resolvePictureView(props: PictureRendererInput): PictureView {
  if (props === null || props === undefined || typeof props !== "object" || Array.isArray(props)) {
    return floor("malformed-props");
  }

  const snapshot = props as Partial<ArtifactRendererProps>;

  // STRICT, in both directions: a snapshot that does not SAY which version it
  // was built at is as unreadable as one built at another version.
  if (snapshot.propsApiVersion !== PICTURE_DISPLAY_PROPS_API_VERSION) {
    return floor("props-version");
  }

  // A PICTURE IS ALWAYS SHOWN AT A PINNED REVISION. Without one there is nothing
  // to name, and an address that meant "the latest" would quietly redraw a
  // review's picture under the reviewer.
  const representation = snapshot.representation as
    | { revisionId?: unknown; mime?: unknown }
    | null
    | undefined;
  if (
    representation === null ||
    representation === undefined ||
    typeof representation !== "object" ||
    typeof representation.revisionId !== "string" ||
    representation.revisionId.length === 0
  ) {
    return floor("no-pinned-revision");
  }
  const revisionId = representation.revisionId;

  // A SECOND OPINION ON THE REVISION, WHERE ONE IS AVAILABLE — and not the
  // authorization. What authorizes the draw is the address itself: the host
  // access-checked it and minted it for the revision it put beside it on this
  // same snapshot. The channel carries no bytes for a picture, but it does say
  // which revision it was built for, so where it says so this display refuses a
  // snapshot whose two halves name different revisions.
  //
  // IT IS READ ONLY AT THE CHANNEL VERSION THIS DISPLAY KNOWS, and it is
  // deliberately NOT required. A projection built at a later channel version may
  // spell its own fields differently, and reading it at this shape would be a
  // guess; a surface that hands a picture display no projection at all is the
  // ordinary case, since a picture is not one of the things the channel
  // projects. Flooring on either would refuse to draw a host-authorized,
  // revision-pinned picture on the strength of a check that was never the
  // authorization. So an absent, unknown-version or shapeless projection leaves
  // the address to speak for itself, and only a projection this display can read
  // AND that disagrees stops the draw.
  const content = snapshot.content as
    | { channelVersion?: unknown; representationRevisionId?: unknown }
    | null
    | undefined;
  if (
    content !== null &&
    content !== undefined &&
    typeof content === "object" &&
    content.channelVersion === 1 &&
    typeof content.representationRevisionId === "string" &&
    content.representationRevisionId !== revisionId
  ) {
    return floor("content-revision-mismatch");
  }

  // ONLY THE FORMS THIS EXTENSION ACCEPTS. A display that painted whatever it
  // was handed would draw a broken picture for a document, which is worse than
  // saying plainly that there is no picture here.
  const form = typeof representation.mime === "string" ? representation.mime : "";
  if (!(PICTURE_FORMS as readonly string[]).includes(form)) {
    return floor("not-a-picture");
  }

  // THE ADDRESS IS THE AUTHORIZATION. The host access-checked it before it built
  // this snapshot; this display references it and alters nothing about it. The
  // preview address is the inline one — the disposition is sealed by whoever
  // minted the address, never chosen here.
  const urls = snapshot.urls as { preview?: unknown } | null | undefined;
  const src =
    urls !== null && urls !== undefined && typeof urls === "object" && typeof urls.preview === "string"
      ? urls.preview
      : "";
  if (src.length === 0) {
    return floor("no-authorized-address");
  }

  return {
    kind: "picture",
    src,
    revisionId,
    form,
    alt: pictureAlt(snapshot.artifact?.title),
  };
}
