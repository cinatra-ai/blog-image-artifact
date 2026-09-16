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

import { pictureFloorMessage, type PictureFloorReason, type PictureView } from "./picture-view";

export type PictureSlot = "detail" | "preview" | "listRow";

/** What this package's displays call themselves on every surface they draw on —
 * the handle a surface, a capture and a test all read. */
export const PICTURE_RENDERER_NAME = "blog-image";

/** The package a sanitized diagnostic names. The drawing's floor is "package ·
 * slot · reason", and the package is this extension's own published name. */
export const PICTURE_RENDERER_PACKAGE = "@cinatra-ai/blog-image-artifact";

/**
 * THE FLOOR'S SANITIZED DIAGNOSTIC — the drawing's own three parts and nothing
 * else: "a sanitized, telemetry-safe one-line diagnostic (package · slot ·
 * reason, never a raw error or manifest value)" (app-artifact-review §V). It
 * carries no sentence, no address and no value off the snapshot, so it is safe
 * to put on a surface a reader shares.
 */
export function pictureFloorDiagnostic(slot: PictureSlot, reason: PictureFloorReason): string {
  return `${PICTURE_RENDERER_PACKAGE} · ${slot} · ${reason}`;
}

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

/**
 * THE LEADING RENDERER GLYPH the row keeps when there is no picture to paint.
 *
 * The drawing gives the row one: "The title line carries a leading renderer
 * glyph, the artifact name … and a muted extension label" (app-artifacts §II).
 * The glyph is the display's own mark, drawn at the thumbnail's size in the
 * cell's own colour, and it is decorative — the row's name is the surface's, and
 * this must add no second reading of it.
 */
function PictureGlyph(): ReactElement {
  return (
    <svg
      className="h-10 w-10 rounded-card"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      data-picture-glyph=""
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5-5-6 6-3-3-4 4" />
    </svg>
  );
}

export function PictureFigure({
  view,
  slot,
}: {
  view: PictureView;
  slot: PictureSlot;
}): ReactElement {
  if (view.kind === "floor") {
    // A ROW IS NEVER WRITTEN INTO. A display "carries no note row of its own: a
    // sentence about a failure … reports through the app's toast surface …,
    // never as a line written into the panel" (app-artifact-review §XI), and a
    // row's whole panel is a glyph cell — a sentence there would be the note row
    // the drawing refuses, drawn where no sentence fits. So the row keeps its
    // leading glyph and reports through the one road the SDK leaves a display
    // for a failure: the sanitized package · slot · reason diagnostic §V fixes,
    // carried as data for the surface and its telemetry rather than as prose for
    // the reader. (The SDK gives displays no floor-report port: nothing under
    // `packages/sdk-extensions/src` exports one, and the host's own row glyph
    // logs exactly this diagnostic and draws its generic mark.)
    //
    // The other two slots have a panel to say it in, and keep their sentence.
    if (slot === "listRow") {
      return (
        <figure
          className={FRAME_CLASSES[slot]}
          data-artifact-renderer={PICTURE_RENDERER_NAME}
          data-slot={slot}
          data-floor={view.reason}
          data-floor-diagnostic={pictureFloorDiagnostic(slot, view.reason)}
        >
          <PictureGlyph />
        </figure>
      );
    }

    return (
      <figure
        className={`${FRAME_CLASSES[slot]} text-sm text-muted-foreground`}
        data-artifact-renderer={PICTURE_RENDERER_NAME}
        data-slot={slot}
        data-floor={view.reason}
        data-floor-diagnostic={pictureFloorDiagnostic(slot, view.reason)}
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
