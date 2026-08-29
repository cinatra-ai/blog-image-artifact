// Blog image LIST ROW renderer (slot `listRow`) — the featured image where a
// surface lists what a run made, beside the other work of the run.
//
// The same picture as the other two slots, at a row's size, so the run's outputs
// list shows the picture itself rather than a generic line naming a file.
//
// v1 renderer: no host ports, no fetching, read-only, no Regenerate.

import type { ReactElement } from "react";

import type { ArtifactRendererProps } from "../artifact-renderer-props";
import { PictureFigure } from "./picture-figure";
import { resolvePictureView } from "./picture-view";

export default function BlogImageListRow(props: ArtifactRendererProps): ReactElement {
  return <PictureFigure view={resolvePictureView(props)} slot="listRow" />;
}
