// THE ROW READS THE VIEW THE HOST HANDS IT TODAY — and a floor never writes a
// sentence into it.
//
// WHAT WENT WRONG, PLAINLY. The same picture drew on its artifact page and
// floored in the row of the same boot, with the reason "it was handed a view of
// a version this display does not read". The two surfaces do not hand a display
// the same snapshot: the artifact page passes its snapshot through the seam that
// NARROWS it to the version the display declared, and the row surface builds one
// at the host's own ceiling and mounts the display with it. A display that read
// only version 1 therefore read every row snapshot as unreadable.
//
// THE VERSION THE HOST HANDS. `ARTIFACT_RENDERER_PROPS_API_VERSION` in
// `@cinatra-ai/sdk-extensions/artifact-renderer-props` is 2 — "IT IS 2 SINCE
// WAVE 3 of `PLAN: Agents Lifecycle (D) - Review`" — and the row surface stamps
// exactly that on the snapshot it builds. It is written out here rather than
// read from this package's own copy ON PURPOSE: this file's whole subject is
// whether this package's copy agrees with the host's, so reading the number off
// the copy under test would make the question unaskable.
//
// WHAT THE ROW DRAWS INSTEAD OF A SENTENCE. A row's whole panel is a glyph cell.
// The drawing gives the row "a leading renderer glyph" (app-artifacts SII) and
// refuses a display "a note row of its own: a sentence about a failure ... never
// as a line written into the panel" (app-artifact-review SXI), and it fixes what
// a floor reports instead: "a sanitized, telemetry-safe one-line diagnostic
// (package, slot, reason, never a raw error or manifest value)" (SV).

import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import Detail from "../src/renderers/detail";
import ListRow from "../src/renderers/list-row";
import Preview from "../src/renderers/preview";
import { pictureFloorMessage } from "../src/renderers/picture-view";
import type { ArtifactRendererProps } from "../src/artifact-renderer-props";
import {
  FIRST_PARTY_PREVIEW,
  ISLAND_BYTE_ADDRESS,
  hostListRowProps,
  islandProps,
  props,
} from "./props-fixture";

type Entry = (p: ArtifactRendererProps) => ReactElement;

/** The version the HOST builds a snapshot at today, read from the SDK leaf. */
const HOST_PROPS_API_VERSION = 2;

/** The package a sanitized diagnostic names, and the slot this file is about. */
const PACKAGE = "@cinatra-ai/blog-image-artifact";
const SLOT = "listRow";

/** Every reason this display can floor with — so a test can assert that NONE of
 * their sentences reached the row. */
const FLOOR_REASONS = [
  "malformed-props",
  "props-version",
  "no-pinned-revision",
  "content-revision-mismatch",
  "not-a-picture",
  "no-authorized-address",
] as const;

/** The two slots that DO have a panel to say a sentence in. A row is the one
 * surface with no place for one, so the rule has to hold for both of these or it
 * is not the row that is special. */
const SENTENCE_SLOTS: ReadonlyArray<readonly [string, Entry]> = [
  ["detail", Detail as Entry],
  ["preview", Preview as Entry],
];

/** One snapshot per floor a HOST CAN ACTUALLY BUILD, so the row's treatment is
 * proven for every reason rather than for the one a row happens to reach.
 * `malformed-props` is not among them on purpose: it is the answer to something
 * that is not a snapshot at all, which no surface mounting a display can hand
 * one. */
const FLOOR_SNAPSHOTS: ReadonlyArray<readonly [string, ArtifactRendererProps]> = [
  ["props-version", props({ propsApiVersion: 1 })],
  ["no-pinned-revision", props({ representation: null })],
  [
    "content-revision-mismatch",
    props({
      content: {
        kind: "none",
        channelVersion: 1,
        representationRevisionId: "rev_other",
        reason: "unsupported-form",
      },
    }),
  ],
  ["not-a-picture", props({ representation: { revisionId: "rev_pic", mime: "application/pdf" } })],
  [
    "no-authorized-address",
    props({
      urls: { preview: null, download: null },
      bytes: { road: "session", preview: null, download: null },
    }),
  ],
];

/** The row's snapshot exactly as the host builds it, at the host's version. */
const rowProps = (overrides: Partial<ArtifactRendererProps> = {}): ArtifactRendererProps =>
  hostListRowProps({ propsApiVersion: HOST_PROPS_API_VERSION, ...overrides });

afterEach(cleanup);

describe("the row reads the view version the host hands it", () => {
  it("never floors a host-built row snapshot for its version", () => {
    const { container } = render(<ListRow {...rowProps()} />);
    const root = container.querySelector("[data-artifact-renderer='blog-image']");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("data-slot")).toBe(SLOT);
    // THE DEFECT ITSELF: the row's snapshot is the host's current one, and this
    // display must read it rather than refuse it for its version.
    expect(root?.getAttribute("data-floor")).not.toBe("props-version");
  });

  it("draws the picture in the row where the host's snapshot carries a pinned revision", () => {
    const { container } = render(
      <ListRow {...props({ propsApiVersion: HOST_PROPS_API_VERSION })} />,
    );
    const picture = container.querySelector("img");
    expect(picture).not.toBeNull();
    expect(picture?.getAttribute("src")).toBe(FIRST_PARTY_PREVIEW);
    expect(
      container.querySelector("[data-artifact-renderer='blog-image']")?.getAttribute("data-revision"),
    ).toBe("rev_pic");
  });

  it("reads it the same way the detail renderer does — the same reason on the same snapshot", () => {
    // The two surfaces disagreed about ONE thing: the version. On a snapshot
    // with nothing to draw they must now reach the same named floor.
    const snapshot = rowProps();
    const row = render(<ListRow {...snapshot} />);
    const rowReason = row.container
      .querySelector("[data-artifact-renderer='blog-image']")
      ?.getAttribute("data-floor");
    row.unmount();
    const detail = render(<Detail {...snapshot} />);
    const detailReason = detail.container
      .querySelector("[data-artifact-renderer='blog-image']")
      ?.getAttribute("data-floor");
    expect(rowReason).toBe("no-pinned-revision");
    expect(detailReason).toBe("no-pinned-revision");
  });
});

describe("the address a v2 snapshot names for the surface the reader is on", () => {
  // DECLARING v2 IS NOT ONLY A NUMBER. The version this display now reads is the
  // one that added the island-scoped byte reference, and the SDK leaf fixes how
  // it is read: "A DISPLAY PAINTS FROM `bytes` WHERE IT IS PRESENT and falls
  // back to `urls` where it is not". `urls` are the host's SESSION routes, and
  // "a subresource load from inside a third-party application carries no cookie
  // — which is why a media display painting from them draws a blank plate
  // there". A display that took the version and not the obligation would stop
  // flooring on the island and quietly draw that blank plate instead, which is
  // worse than the floor it replaced.

  it("paints the sealed byte address inside a third-party application, not the session route", () => {
    const snapshot = islandProps();
    expect(snapshot.bytes?.preview).not.toBe(snapshot.urls.preview);
    const { container } = render(<ListRow {...snapshot} />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe(ISLAND_BYTE_ADDRESS);
  });

  it("falls back to the session route where the host carried no byte reference", () => {
    const snapshot = props();
    delete snapshot.bytes;
    const { container } = render(<ListRow {...snapshot} />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe(FIRST_PARTY_PREVIEW);
  });

  it("floors where the reference the host carried names no address to fetch", () => {
    // A reference that is present and names nothing is the host's answer FOR
    // THIS SURFACE, never a licence to reach past it for a session route this
    // surface cannot load.
    const { container } = render(
      <ListRow
        {...props({ bytes: { road: "island", preview: null, download: null } })}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(
      container.querySelector("[data-artifact-renderer='blog-image']")?.getAttribute("data-floor"),
    ).toBe("no-authorized-address");
  });
});

describe("a true floor never writes a sentence into the row", () => {
  it("keeps the row's leading renderer glyph and writes no text at all", () => {
    const { container } = render(<ListRow {...rowProps()} />);
    expect(container.querySelector("[data-picture-glyph]")).not.toBeNull();
    // NOT ONE CHARACTER, and not one text node either — a blank one is still a
    // line written into a cell that has no room for a line. A row's panel has no
    // place for a note row, and the artifact's own name is the surface's to
    // draw, never this display's.
    expect(container.textContent).toBe("");
    const walker = container.ownerDocument.createTreeWalker(container, 4 /* SHOW_TEXT */);
    expect(walker.nextNode()).toBeNull();
    for (const reason of FLOOR_REASONS) {
      expect(container.textContent ?? "").not.toContain(pictureFloorMessage(reason));
    }
  });

  it.each(FLOOR_SNAPSHOTS)("says it the same way for the %s floor", (reason, snapshot) => {
    // EVERY REASON, not the one a row happens to reach: a sentence added back
    // for a single floor would be exactly the regression this rule is against.
    const { container } = render(<ListRow {...snapshot} />);
    const root = container.querySelector("[data-artifact-renderer='blog-image']");
    expect(root?.getAttribute("data-floor")).toBe(reason);
    expect(container.textContent).toBe("");
    expect(container.querySelector("[data-picture-glyph]")).not.toBeNull();
    expect(root?.getAttribute("data-floor-diagnostic")).toBe(`${PACKAGE} · ${SLOT} · ${reason}`);
  });

  it("reports through the sanitized package, slot and reason diagnostic instead", () => {
    const { container } = render(<ListRow {...rowProps()} />);
    const root = container.querySelector("[data-artifact-renderer='blog-image']");
    const diagnostic = root?.getAttribute("data-floor-diagnostic") ?? "";
    expect(diagnostic).toBe(`${PACKAGE} · ${SLOT} · no-pinned-revision`);
    // Sanitized: the three parts and nothing else — no sentence, no address off
    // the snapshot, no manifest value.
    for (const reason of FLOOR_REASONS) {
      expect(diagnostic).not.toContain(pictureFloorMessage(reason));
    }
    expect(diagnostic).not.toContain("/api/");
  });

  it("carries nothing off the snapshot into the diagnostic, on a snapshot full of things to leak", () => {
    const { container } = render(
      <ListRow
        {...props({
          representation: null,
          artifact: { ...props().artifact, title: "SECRET-TITLE", id: "SECRET-ID" },
        })}
      />,
    );
    const diagnostic =
      container
        .querySelector("[data-artifact-renderer='blog-image']")
        ?.getAttribute("data-floor-diagnostic") ?? "";
    expect(diagnostic).toBe(`${PACKAGE} · ${SLOT} · no-pinned-revision`);
    expect(diagnostic).not.toContain("SECRET-TITLE");
    expect(diagnostic).not.toContain("SECRET-ID");
  });

  it.each(SENTENCE_SLOTS)("leaves the %s slot its sentence — only a row has no place for one", (_name, Entry) => {
    const { container } = render(<Entry {...rowProps()} />);
    const floor = container.querySelector("[data-floor='no-pinned-revision']");
    expect(floor).not.toBeNull();
    expect((floor?.textContent ?? "").trim()).toBe(pictureFloorMessage("no-pinned-revision"));
    expect(container.querySelector("[data-picture-glyph]")).toBeNull();
  });
});
