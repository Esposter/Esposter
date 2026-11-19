import { readCitedComponents } from "#src/services/genshinParity/componentReference/readCitedComponents";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { describe, expect, test } from "vitest";

const CITED = `packages/${TEST_FILENAME}/src/components/${TEST_FILENAME}/Index.vue`;
const BARE = `packages/${TEST_FILENAME}/src/components/${TEST_FILENAME}b/Index.vue`;

describe(readCitedComponents, () => {
  test("names a component only on a line that also names its reference", () => {
    expect.hasAssertions();

    const text = [
      `${CITED} is timed from {data-root}/genshin-parity/captures/yt-sQNqMfmfkZU-splash-opening.mp4.`,
      `${BARE} is named with no reference.`,
    ].join("\n");

    expect(readCitedComponents([text])).toStrictEqual(new Set([CITED]));
  });
});
