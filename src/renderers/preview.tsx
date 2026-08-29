// Blog image PREVIEW renderer (slot `preview`) — the featured image on ITS OWN
// REVIEW, card-sized.
//
// This is the slot the review card mounts, and the one that draws inside a
// third-party application: there the address on the snapshot is the island's,
// sealed to the gate that pinned this revision, and painting it is what makes
// the picture appear where a display that fetched would paint nothing.
//
// The post's own display draws no picture; this one does. Read-only, and no
// Regenerate — that control belongs to the review screen.

import type { ReactElement } from "react";

import type { ArtifactRendererProps } from "../artifact-renderer-props";
import { PictureFigure } from "./picture-figure";
import { resolvePictureView } from "./picture-view";

export default function BlogImagePreview(props: ArtifactRendererProps): ReactElement {
  return <PictureFigure view={resolvePictureView(props)} slot="preview" />;
}
