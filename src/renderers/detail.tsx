// Blog image DETAIL renderer (slot `detail`) — the featured image on its own
// artifact page, drawn whole.
//
// v1 renderer: it requests NO host ports and it never fetches. It paints the
// host-authorized address on the snapshot and nothing else.

import type { ReactElement } from "react";

import type { ArtifactRendererProps } from "../artifact-renderer-props";
import { PictureFigure } from "./picture-figure";
import { resolvePictureView } from "./picture-view";

export default function BlogImageDetail(props: ArtifactRendererProps): ReactElement {
  return <PictureFigure view={resolvePictureView(props)} slot="detail" />;
}
