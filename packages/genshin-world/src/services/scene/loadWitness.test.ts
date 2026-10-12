import type { WitnessMaterialFactory } from "#src/models/scene/WitnessMaterialFactory";
import type { SceneLayout } from "genshin-engine";

import { loadWitness } from "#src/services/scene/loadWitness";
import { ToonNodeMaterial } from "genshin-engine";
import { afterEach, describe, expect, test, vi } from "vitest";

const createMaterialFactory: WitnessMaterialFactory = () => new ToonNodeMaterial({}, false);

describe("loadWitness", () => {
  const LAYOUT_URL = "/witness/layout.json";

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("rejects a rigidly skinned mesh whose OBJ answers with a failed status rather than drawing none of it", async () => {
    expect.hasAssertions();

    const layout: SceneLayout = {
      materials: {},
      placements: [{ materials: [], mesh: "Door", position: [0, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] }],
    };
    vi.stubGlobal("window", { location: { href: "http://localhost/" } });
    vi.stubGlobal(
      "fetch",
      vi.fn<(url: string) => Promise<Response>>((url) => {
        if (url === LAYOUT_URL) return Promise.resolve(Response.json(layout));
        if (url.endsWith(".obj")) return Promise.resolve(new Response("<html>Not Found</html>", { status: 404 }));
        return Promise.resolve(Response.json({ m_Skin: [] }));
      }),
    );

    await expect(
      loadWitness(LAYOUT_URL, createMaterialFactory, { Door: /^Door$/u }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: http://localhost/witness/Mesh/Door.obj, HTTP 404 ]`,
    );
  });
});
