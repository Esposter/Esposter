import { getExternalId } from "#src/services/voiceMatch/reference/getExternalId";
import { describe, expect, test } from "vitest";

describe(getExternalId, () => {
  test("hashes a recorded stem to the id the Japanese track files its clip under", () => {
    expect.hasAssertions();

    // Read off the package's own table, so any other spelling of the path — the case, the slashes, the language
    // Folder or the extension — misses it
    expect(getExternalId("VO_friendship/VO_clorinde/vo_clorinde_character_idle_03")).toBe(16_092_681_363_853_473_498n);
  });
});
