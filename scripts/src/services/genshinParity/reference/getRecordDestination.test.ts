import { getRecordDestination } from "#src/services/genshinParity/reference/getRecordDestination";
import { getRecordPath } from "#src/services/genshinParity/reference/getRecordPath";
import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(getRecordDestination, () => {
  test("restores a record packed from a Windows-style path to the same place on any host", () => {
    expect.hasAssertions();

    expect(getRecordDestination(getRecordPath(String.raw`extracted\maps\gi_map.bin`))).toBe(
      join(PARITY_DIRECTORY, "extracted", "maps", "gi_map.bin"),
    );
  });
});
