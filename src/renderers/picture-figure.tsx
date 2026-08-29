// The drawn picture, and the floor beside it — the chrome all three slots share,
// so the artifact page, the review and the run page's outputs can never disagree
// about what the featured image looks like or about what they say when it cannot
// be shown.
//
// THE ONE ROAD OUT OF THIS PACKAGE is the image element below. It paints the
// host-authorized address as a SUBRESOURCE LOAD — which is what carries the
// island's sealed capability inside a third-party application — and this package
// opens no other: no fetch, no link, no frame, no download. A link would be a
// navigation, and the island byte route refuses every navigation.
//
// READ-ONLY, ON EVERY SURFACE. It draws and nothing else: no editing affordance
// and no Regenerate. Regenerating a picture is the review screen's control,
// never a renderer's.

import type { ReactElement } from "react";

import { pictureFloorMessage, type PictureView } from "./picture-view";

export type PictureSlot = "detail" | "preview" | "listRow";

/** What this package's displays call themselves on every surface they draw on —
 * the handle a surface, a capture and a test all read. */
export const PICTURE_RENDERER_NAME = "blog-image";

/** Each slot gives the picture the room its surface has: the page draws it
 * whole, the review card draws it card-sized, and a row in a list of a run's
 * outputs draws it as a thumbnail beside the name. */
const FRAME_CLASSES: Record<PictureSlot, string> = {
  detail: "soft-panel rounded-card overflow-hidden p-6",
  preview: "soft-panel rounded-card overflow-hidden p-4",
  listRow: "flex items-center gap-3 py-2",
};

const IMAGE_CLASSES: Record<PictureSlot, string> = {
  detail: "h-auto w-full rounded-card",
  preview: "max-h-72 w-full rounded-card object-cover",
  listRow: "h-10 w-10 rounded-card object-cover",
};

export function PictureFigure({
  view,
  slot,
}: {
  view: PictureView;
  slot: PictureSlot;
}): ReactElement {
  if (view.kind === "floor") {
    return (
      <figure
        className={`${FRAME_CLASSES[slot]} text-sm text-muted-foreground`}
        data-artifact-renderer={PICTURE_RENDERER_NAME}
        data-slot={slot}
        data-floor={view.reason}
      >
        <figcaption>{pictureFloorMessage(view.reason)}</figcaption>
      </figure>
    );
  }

  return (
    <figure
      className={FRAME_CLASSES[slot]}
      data-artifact-renderer={PICTURE_RENDERER_NAME}
      data-slot={slot}
      data-revision={view.revisionId}
      data-form={view.form}
    >
      <img className={IMAGE_CLASSES[slot]} src={view.src} alt={view.alt} />
      {slot === "listRow" ? <figcaption className="text-sm font-medium">{view.alt}</figcaption> : null}
    </figure>
  );
}
