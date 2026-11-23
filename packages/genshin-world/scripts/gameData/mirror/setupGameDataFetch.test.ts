import { readMirroredGameDataFile } from "#scripts/gameData/mirror/readMirroredGameDataFile";
import { HOSTED_ASSETS_LOCAL_BASE_URL } from "hosted-assets";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#scripts/gameData/mirror/readMirroredGameDataFile"), () => ({
  readMirroredGameDataFile: vi.fn<typeof readMirroredGameDataFile>(),
}));

describe("setupGameDataFetch", () => {
  const hash = "0".repeat(64);
  const bytes = Buffer.from("texture");

  test("a suite that loads a hosted object runs offline", async () => {
    expect.hasAssertions();

    vi.mocked(readMirroredGameDataFile).mockResolvedValueOnce(bytes);

    const response = await fetch(`${HOSTED_ASSETS_LOCAL_BASE_URL}/dungeons/${hash}.png`);

    expect(readMirroredGameDataFile).toHaveBeenCalledExactlyOnceWith(`dungeons/${hash}.png`, hash);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(new Uint8Array(await response.arrayBuffer())).toStrictEqual(new Uint8Array(bytes));
  });
});
