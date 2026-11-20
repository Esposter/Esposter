import type { Mock } from "vitest";

import { ImageDouble } from "#src/services/capture/ImageDouble.test";
import { rasterizeSvg } from "#src/services/message/room/realtime/rasterizeSvg";
import { noop } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(rasterizeSvg, () => {
  // The browser's image, canvas and fetch are missing from the node environment, so the test stands in for them
  // The image loads on the next tick, and the canvas hands back a blob of the export
  const BLOB_URL = "blob:png";
  const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"></svg>';

  let fetchSvg: Mock<(url: string) => Promise<Response>>;
  let toBlob: Mock<(callback: BlobCallback, type: string) => void>;

  beforeEach(() => {
    fetchSvg = vi.fn<(url: string) => Promise<Response>>(() => Promise.resolve(new Response(SVG)));
    toBlob = vi.fn<(callback: BlobCallback, type: string) => void>((callback) => {
      callback(new Blob([], { type: "image/png" }));
    });
    const canvas = { getContext: () => ({ drawImage: vi.fn<() => void>() }), height: 0, toBlob, width: 0 };
    vi.stubGlobal("fetch", fetchSvg);
    vi.stubGlobal("Image", ImageDouble);
    vi.stubGlobal("window", { document: { createElement: () => canvas } });
    vi.spyOn(URL, "createObjectURL").mockReturnValue(BLOB_URL);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(noop);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("two picks of one preset that overlap rasterize it once and share the result", async () => {
    expect.hasAssertions();

    const svgUrl = "/background/overlapping.svg";
    const results = await Promise.all([rasterizeSvg(svgUrl), rasterizeSvg(svgUrl)]);

    expect(fetchSvg).toHaveBeenCalledExactlyOnceWith(svgUrl);
    expect(results).toStrictEqual([BLOB_URL, BLOB_URL]);
  });

  test("a preset whose rasterization fails is read again on the next pick", async () => {
    expect.hasAssertions();

    const svgUrl = "/background/failing.svg";
    fetchSvg.mockRejectedValueOnce(new TypeError("network"));

    await expect(rasterizeSvg(svgUrl)).resolves.toBeUndefined();
    await expect(rasterizeSvg(svgUrl)).resolves.toBe(BLOB_URL);
    expect(fetchSvg).toHaveBeenCalledTimes(2);
  });
});
