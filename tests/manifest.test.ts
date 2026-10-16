// @vitest-environment node
// THE BLOG-IMAGE TYPE'S DATA NAMES ITS POST AND ITS PLACEMENT, and the extension
// registers NO display of its own.
//
// THE PLAN'S SENTENCE, VERBATIM (§8.2): "The blog-image type declares two
// fields on its object type — the post artifact and the placement". The type
// declared NOTHING at all before: a bare `{ type: "object" }` with no
// properties, in both the manifest of record and the typed source manifest.
//
// THE PLACEMENT'S ONE VALUE. The pipeline makes one picture, the featured image;
// there are no body pictures. The enum therefore admits `featured` and nothing
// else — a schema that admitted a body picture would declare data the pipeline
// is ruled never to make.
//
// NO DISPLAY OF ITS OWN. A blog image is drawn by the host's image display, like
// every other image artifact. The manifest of record and the typed manifest
// carry no `ui` block, the package publishes no display entry, and the source
// tree holds no display module.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

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
      ui?: unknown;
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
const SRC = fileURLToPath(new URL("../src/", import.meta.url));

const claim = () => pkg.cinatra.artifact.objectTypes.find((c) => c.type === OWN_TYPE);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? sourceFiles(`${dir}${d.name}/`) : [`${dir}${d.name}`],
  );
}

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

  it("accepts only the picture forms it names — no wildcard", () => {
    expect(pkg.cinatra.artifact.accepts.file.mimeTypes).toEqual(MIMES);
  });

  it("keeps the typed src manifest in agreement with package.json", () => {
    expect(blogImageArtifactManifest).toEqual(pkg.cinatra.artifact);
  });
});

describe("the extension registers no display of its own", () => {
  it("declares no ui block in the manifest of record or the typed manifest", () => {
    expect(pkg.cinatra.artifact.ui).toBeUndefined();
    expect("ui" in pkg.cinatra.artifact).toBe(false);
    expect(blogImageArtifactManifest.ui).toBeUndefined();
    expect("ui" in blogImageArtifactManifest).toBe(false);
  });

  it("publishes the package root and no display entry", () => {
    expect(Object.keys(pkg.exports)).toEqual(["."]);
    for (const target of Object.values(pkg.exports)) {
      expect(target.includes("renderers")).toBe(false);
    }
  });

  it("holds no display module in its source tree", () => {
    expect(existsSync(`${SRC}renderers`)).toBe(false);
    for (const file of sourceFiles(SRC)) {
      expect(file.endsWith(".tsx")).toBe(false);
      const text = readFileSync(file, "utf8");
      expect(text).not.toMatch(/\brenderers\s*:/);
      expect(text).not.toMatch(/\bui\s*:\s*\{/);
    }
  });
});

describe("the package keeps its shape", () => {
  it("declares an exports subpath map, never a bare sugar target and never a pattern", () => {
    expect(typeof pkg.exports).toBe("object");
    expect(Array.isArray(pkg.exports)).toBe(false);
    for (const key of Object.keys(pkg.exports)) {
      expect(key.startsWith(".")).toBe(true);
      expect(key.includes("*")).toBe(false);
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

  it("carries no picture library of its own", () => {
    const named = [
      ...Object.keys((pkg as unknown as { dependencies?: Record<string, string> }).dependencies ?? {}),
    ];
    expect(named).toEqual([]);
  });
});
