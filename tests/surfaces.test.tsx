// ACCEPTANCE 1 and 2 for the picture — THE BLOG IMAGE DISPLAY DRAWS THE
// FEATURED IMAGE ON ITS OWN SURFACES, at the pinned revision, and paints inside
// a third-party application.
//
// THE RULING this display exists for: "the featured image is drawn by the
// blog-image display on its review, on the run page's outputs and on its
// artifact page" — three surfaces, three slots, one display. The post's own
// display draws no picture; this one draws it.
//
// AND IT PAINTS THROUGH THE ISLAND. Inside a third-party application the host
// hands this display an island-scoped byte address instead of the first-party
// one. The picture is a SUBRESOURCE LOAD — the URL is the whole request, which
// is what the island byte capability is for — so this display paints that
// address and never links it, never fetches it, and never turns it into a
// download the route would refuse.

import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import Detail from "../src/renderers/detail";
import Preview from "../src/renderers/preview";
import ListRow from "../src/renderers/list-row";
import { PICTURE_DISPLAY_PROPS_API_VERSION } from "../src/renderers/picture-view";
import type { ArtifactRendererProps } from "../src/artifact-renderer-props";
import { FIRST_PARTY_PREVIEW, ISLAND_BYTE_ADDRESS, islandProps, pictureContent, props } from "./props-fixture";

type Entry = (p: ArtifactRendererProps) => ReactElement;

/** The three surfaces the acceptance names, each with the slot the host mounts
 * there. */
const SURFACES: Array<{ name: string; slot: string; Entry: Entry }> = [
  { name: "its artifact page", slot: "detail", Entry: Detail as Entry },
  { name: "its review", slot: "preview", Entry: Preview as Entry },
  { name: "the run page's outputs", slot: "listRow", Entry: ListRow as Entry },
];

afterEach(cleanup);

describe("the blog image display draws the featured image on its own surfaces", () => {
  for (const surface of SURFACES) {
    it(`draws the picture on ${surface.name}, at the revision the gate pinned`, () => {
      const { container } = render(
        <surface.Entry
          {...props({
            representation: { revisionId: "rev_7", mime: "image/png" },
            content: pictureContent("rev_7"),
          })}
        />,
      );
      const root = container.querySelector("[data-artifact-renderer='blog-image']");
      expect(root).not.toBeNull();
      expect(root?.getAttribute("data-slot")).toBe(surface.slot);
      expect(root?.getAttribute("data-revision")).toBe("rev_7");
      const picture = container.querySelector("img");
      expect(picture).not.toBeNull();
      expect(picture?.getAttribute("src")).toBe(FIRST_PARTY_PREVIEW);
    });

    it(`on ${surface.name} the picture carries a name a reader can hear`, () => {
      const { container } = render(<surface.Entry {...props()} />);
      const alt = container.querySelector("img")?.getAttribute("alt") ?? "";
      expect(alt.trim().length).toBeGreaterThan(0);
      expect(alt).toContain("Why brand voice travels");
    });

    it(`on ${surface.name} it is READ-ONLY: nothing to edit, and no Regenerate`, () => {
      // Regenerate is the review screen's control, never a renderer's.
      const { container } = render(<surface.Entry {...props()} />);
      expect(container.querySelector("button")).toBeNull();
      expect(container.querySelector("input")).toBeNull();
      expect(container.querySelector("form")).toBeNull();
      expect(container.querySelector("[contenteditable]")).toBeNull();
      expect(container.textContent ?? "").not.toContain("Regenerate");
    });
  }

  it("paints inside a third-party application, through the island's sealed address", () => {
    const { container } = render(<Preview {...islandProps()} />);
    const picture = container.querySelector("img");
    expect(picture).not.toBeNull();
    // The address IS the authorization: the display paints it verbatim, exactly
    // as the host sealed it, and alters nothing about it.
    expect(picture?.getAttribute("src")).toBe(ISLAND_BYTE_ADDRESS);
    expect(container.querySelector("[data-artifact-renderer='blog-image']")?.getAttribute("data-revision")).toBe(
      "rev_pic",
    );
  });

  it("never turns the island's address into a link — the route refuses a navigation", () => {
    const { container } = render(<Preview {...islandProps()} />);
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("[download]")).toBeNull();
  });

  it("never fetches the bytes itself: no request road is touched, on any surface", () => {
    // A display that fetched is exactly the display that paints nothing inside
    // a third-party application: a subresource load carries the sealed URL, a
    // fetch carries nothing.
    for (const surface of SURFACES) {
      const calls: string[] = [];
      const win = window as unknown as Record<string, unknown>;
      const saved = {
        fetch: win.fetch,
        XMLHttpRequest: win.XMLHttpRequest,
        EventSource: win.EventSource,
        WebSocket: win.WebSocket,
        sendBeacon: (win.navigator as Navigator | undefined)?.sendBeacon,
      };
      win.fetch = (...a: unknown[]) => {
        calls.push(`fetch ${String(a[0])}`);
        return Promise.reject(new Error("no"));
      };
      class WatchedXhr {
        open(_m: string, u: string) {
          calls.push(`xhr ${u}`);
        }
        send() {}
        setRequestHeader() {}
      }
      win.XMLHttpRequest = WatchedXhr as unknown;
      win.EventSource = class {
        constructor(u: string) {
          calls.push(`sse ${u}`);
        }
      } as unknown;
      win.WebSocket = class {
        constructor(u: string) {
          calls.push(`ws ${u}`);
        }
      } as unknown;
      (win.navigator as Navigator).sendBeacon = ((u: string) => {
        calls.push(`beacon ${u}`);
        return true;
      }) as Navigator["sendBeacon"];
      try {
        const { unmount } = render(<surface.Entry {...islandProps()} />);
        expect(calls, surface.name).toEqual([]);
        unmount();
      } finally {
        win.fetch = saved.fetch;
        win.XMLHttpRequest = saved.XMLHttpRequest;
        win.EventSource = saved.EventSource;
        win.WebSocket = saved.WebSocket;
        if (saved.sendBeacon) {
          (win.navigator as Navigator).sendBeacon = saved.sendBeacon;
        } else {
          delete (win.navigator as unknown as Record<string, unknown>).sendBeacon;
        }
      }
    }
  });
});

describe("the picture display floors, NAMED and never blank, rather than painting a guess", () => {
  const cases: Array<[ArtifactRendererProps, string]> = [
    [props({ propsApiVersion: PICTURE_DISPLAY_PROPS_API_VERSION + 1 }), "props-version"],
    [props({ representation: null }), "no-pinned-revision"],
    [
      // The bytes the host authorized were read from another revision than the
      // one this view says it is showing.
      props({ content: pictureContent("rev_other") }),
      "content-revision-mismatch",
    ],
    [
      props({ representation: { revisionId: "rev_pic", mime: "text/markdown" } }),
      "not-a-picture",
    ],
    [
      props({ urls: { preview: null, download: null }, actions: { download: null, openInSource: null } }),
      "no-authorized-address",
    ],
  ];

  for (const [p, reason] of cases) {
    it(`floors with "${reason}" and says so in words`, () => {
      const { container } = render(<Detail {...p} />);
      const floor = container.querySelector(`[data-floor='${reason}']`);
      expect(floor, reason).not.toBeNull();
      expect((floor?.textContent ?? "").trim().length, reason).toBeGreaterThan(0);
      expect(container.querySelector("img"), reason).toBeNull();
    });
  }

  it("never throws on a shape it did not expect — a display that threw takes the surface down", () => {
    for (const bad of [null, undefined, 42, "a string", []] as unknown[]) {
      const { container, unmount } = render(<Detail {...(bad as ArtifactRendererProps)} />);
      expect(container.querySelector("[data-floor]")).not.toBeNull();
      unmount();
    }
  });
});

describe("the revision cross-check is a second opinion, never the authorization", () => {
  // Pinned so the deliberate shape cannot drift into an accident: the address
  // the host minted is what authorizes the draw, and a projection this display
  // cannot read is not a reason to refuse a host-authorized picture.
  it("draws when the snapshot carries no content projection at all", () => {
    const snapshot = props();
    delete (snapshot as { content?: unknown }).content;
    const { container } = render(<Detail {...snapshot} />);
    expect(container.querySelector("img")).not.toBeNull();
    expect(container.querySelector("[data-floor]")).toBeNull();
  });

  it("draws when the projection is at an unknown channel version, whatever it names", () => {
    const snapshot = props();
    (snapshot as { content?: unknown }).content = {
      channelVersion: 2,
      representationRevisionId: "rev_from_another_revision",
    };
    const { container } = render(<Detail {...snapshot} />);
    expect(container.querySelector("img")).not.toBeNull();
    expect(container.querySelector("[data-floor]")).toBeNull();
  });

  it("refuses when a projection it CAN read names another revision", () => {
    const snapshot = props();
    (snapshot as { content?: unknown }).content = {
      channelVersion: 1,
      representationRevisionId: "rev_from_another_revision",
    };
    const { container } = render(<Detail {...snapshot} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-floor='content-revision-mismatch']")).not.toBeNull();
  });
});
