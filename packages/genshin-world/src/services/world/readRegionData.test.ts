import liyueRegionJson from "#src/data/regions/liyue.json";
import mondstadtRegionJson from "#src/data/regions/mondstadt.json";
import { regionDataSchema } from "#src/models/world/RegionData";
import { readRegionData } from "#src/services/world/readRegionData";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readRegionData, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("fetches a region once for every reader that asks for it at the same time", async () => {
    expect.hasAssertions();

    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(Response.json(mondstadtRegionJson)));
    vi.stubGlobal("fetch", fetchMock);

    const [first, second] = await Promise.all([
      readRegionData("regions", "mondstadt"),
      readRegionData("regions", "mondstadt"),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  test("fetches a region again after its read fails", async () => {
    expect.hasAssertions();

    const networkError = new TypeError("network down");
    const fetchMock = vi
      .fn<typeof fetch>(() => Promise.resolve(Response.json(liyueRegionJson)))
      .mockRejectedValueOnce(networkError);
    vi.stubGlobal("fetch", fetchMock);

    await expect(readRegionData("regions", "liyue")).rejects.toBe(networkError);
    await expect(readRegionData("regions", "liyue")).resolves.toStrictEqual(regionDataSchema.parse(liyueRegionJson));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
