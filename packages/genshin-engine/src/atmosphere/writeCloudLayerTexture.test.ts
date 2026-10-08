import { createCloudLayerTexture } from "#src/atmosphere/createCloudLayerTexture";
import { writeCloudLayerTexture } from "#src/atmosphere/writeCloudLayerTexture";
import { describe, expect, test } from "vitest";

describe(writeCloudLayerTexture, () => {
  test("writes the fields' first row as the texture's last, each share as a byte", () => {
    expect.hasAssertions();

    const texture = createCloudLayerTexture({ height: 2, width: 1 });
    writeCloudLayerTexture(texture, (index) => [index, 0, 0, 1]);

    expect([...(texture.image.data ?? [])]).toStrictEqual([255, 0, 0, 255, 0, 0, 0, 255]);
  });
});
