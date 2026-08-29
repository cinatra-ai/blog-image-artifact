// @vitest-environment node
// ACCEPTANCE 2, second half — THE BLOG-IMAGE TYPE'S DATA NAMES ITS POST AND ITS
// PLACEMENT, and the display is published for this extension's own type.
//
// THE PLAN'S SENTENCE, VERBATIM (§8.2): "The blog-image type declares two
// fields on its object type — the post artifact and the placement". The type
// declared NOTHING at all before this wave: a bare `{ type: "object" }` with no
// properties, in both the manifest of record and the typed source manifest.
//
// THE PLACEMENT'S ONE VALUE. The plan's own row wrote "(featured or body)"; the
// issue's later ruling settles it: "The pipeline makes one picture, the featured
// image. ... There are no body pictures." The enum therefore admits `featured`
// and nothing else — a schema that admitted a body picture would declare data
// the pipeline is ruled never to make.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { PICTURE_DISPLAY_PROPS_API_VERSION } from "../src/renderers/picture-view";
import { blogImageArtifactManifest } from "../src/index";

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
) as {
  name: string;
  main: string;
  files: string[];
  exports: Record<string, string>;
  peerDependencies: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  cinatra: {
    artifact: {
      accepts: { file: { mimeTypes: string[] } };
      ui: {
        abiVersion: number;
        sdkAbiRange: string;
        renderers: Record<string, { entry: string; propsApiVersion: number; representations?: string[] }>;
      };
      objectTypes: Array<{
        type: string;
        claim: string;
        schema: {
          type: string;
          properties?: Record<string, { type?: string; enum?: string[] }>;
          required?: string[];
          additionalProperties?: boolean;
        };
      }>;
    };
  };
};

const MIMES = ["image/png", "image/jpeg", "image/webp"];
const OWN_TYPE = "@cinatra-ai/blog-image-artifact:blog-image";
const ARTIFACT_UI_RENDERER_ALLOWED_KEYS = new Set(["entry", "propsApiVersion", "representations"]);

function generatorExportsKeyForEntry(entry: string): string {
  return `./${entry.replace(/^\.\//, "").replace(/\.(ts|tsx)$/, "")}`;
}

const claim = () => pkg.cinatra.artifact.objectTypes.find((c) => c.type === OWN_TYPE);

describe("the blog-image type declares its post and its placement", () => {
  it("still claims exactly the one dedicated type this extension owns", () => {
    expect(pkg.cinatra.artifact.objectTypes).toHaveLength(1);
    expect(claim()?.claim).toBe("dedicated");
  });

  it("declares the POST the picture belongs to", () => {
    const post = claim()?.schema.properties?.post;
    expect(post).toBeDefined();
    expect(post?.type).toBe("string");
  });

  it("declares the PLACEMENT, and admits only the featured one", () => {
    const placement = claim()?.schema.properties?.placement;
    expect(placement).toBeDefined();
    expect(placement?.type).toBe("string");
    expect(placement?.enum).toEqual(["featured"]);
  });

  it("requires both fields — a picture with neither belongs to no post and sits nowhere", () => {
    expect(claim()?.schema.required?.slice().sort()).toEqual(["placement", "post"]);
  });

  it("keeps the typed src manifest in agreement with package.json", () => {
    expect(blogImageArtifactManifest.objectTypes).toEqual(pkg.cinatra.artifact.objectTypes);
    expect(blogImageArtifactManifest.ui).toEqual(pkg.cinatra.artifact.ui);
    expect(blogImageArtifactManifest.accepts).toEqual(pkg.cinatra.artifact.accepts);
  });
});

describe("the display is declared for this extension's own type", () => {
  it("declares a strict v1 ui block bound to the generated host SDK ABI range", () => {
    expect(pkg.cinatra.artifact.ui.abiVersion).toBe(1);
    expect(pkg.cinatra.artifact.ui.sdkAbiRange).toBe("^2.5.0");
  });

  it("ships the three slots the three surfaces mount, each naming its own entry", () => {
    const renderers = pkg.cinatra.artifact.ui.renderers;
    expect(Object.keys(renderers).sort()).toEqual(["detail", "listRow", "preview"]);
    expect(renderers.detail.entry).toBe("./src/renderers/detail.tsx");
    expect(renderers.preview.entry).toBe("./src/renderers/preview.tsx");
    expect(renderers.listRow.entry).toBe("./src/renderers/list-row.tsx");
  });

  it("draws only the picture forms this extension itself accepts — no wildcard", () => {
    expect(pkg.cinatra.artifact.accepts.file.mimeTypes).toEqual(MIMES);
    for (const renderer of Object.values(pkg.cinatra.artifact.ui.renderers)) {
      expect(renderer.representations).toEqual(MIMES);
      for (const form of renderer.representations ?? []) {
        expect(form.includes("*")).toBe(false);
        expect(MIMES).toContain(form);
      }
    }
  });

  it("declares the props version the display actually accepts a snapshot at", () => {
    for (const renderer of Object.values(pkg.cinatra.artifact.ui.renderers)) {
      expect(renderer.propsApiVersion).toBe(PICTURE_DISPLAY_PROPS_API_VERSION);
      for (const k of Object.keys(renderer)) {
        expect(ARTIFACT_UI_RENDERER_ALLOWED_KEYS.has(k)).toBe(true);
      }
    }
  });

  it("requests NO host ports — a v1 display renders from the snapshot alone", () => {
    for (const renderer of Object.values(pkg.cinatra.artifact.ui.renderers)) {
      expect(Object.keys(renderer).sort()).toEqual(["entry", "propsApiVersion", "representations"]);
    }
  });
});

describe("the display is published by the package itself", () => {
  it("declares an exports subpath map, never a bare sugar target and never a pattern", () => {
    expect(typeof pkg.exports).toBe("object");
    expect(Array.isArray(pkg.exports)).toBe(false);
    for (const key of Object.keys(pkg.exports)) {
      expect(key.startsWith(".")).toBe(true);
      expect(key.includes("*")).toBe(false);
    }
  });

  it("publishes EVERY declared display at the generator's key", () => {
    for (const renderer of Object.values(pkg.cinatra.artifact.ui.renderers)) {
      const key = generatorExportsKeyForEntry(renderer.entry);
      expect(Object.keys(pkg.exports)).toContain(key);
      expect(pkg.exports[key]).toBe(renderer.entry);
    }
  });

  it("keeps the package ROOT importable — an exports map closes every path it does not name", () => {
    expect(pkg.exports["."]).toBe("./src/index.ts");
    expect(pkg.exports["."]).toBe(pkg.main);
  });

  it("keeps every exports target inside the published files allowlist, and existing", () => {
    expect(pkg.files).toContain("src");
    for (const target of Object.values(pkg.exports)) {
      expect(target.startsWith("./src/")).toBe(true);
      const resolved = fileURLToPath(new URL(`../${target.slice(2)}`, import.meta.url));
      expect(() => readFileSync(resolved, "utf8")).not.toThrow();
    }
  });

  it("carries no picture library of its own — the bytes are painted, never parsed", () => {
    const named = [
      ...Object.keys((pkg as unknown as { dependencies?: Record<string, string> }).dependencies ?? {}),
    ];
    expect(named).toEqual([]);
  });
});
