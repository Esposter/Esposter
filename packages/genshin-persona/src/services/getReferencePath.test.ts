import { VoiceLanguage } from "#src/models/VoiceLanguage";
import { REFERENCES_DIRECTORY } from "#src/services/constants";
import { getReferencePath } from "#src/services/getReferencePath";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(getReferencePath, () => {
  const languageDirectory = join(REFERENCES_DIRECTORY, VoiceLanguage.English);

  test("caches the clip under its dub by its own stem", () => {
    expect.hasAssertions();

    expect(getReferencePath("Clorinde More About Clorinde - 03", VoiceLanguage.English)).toBe(
      join(languageDirectory, "Clorinde More About Clorinde - 03.ogg"),
    );
  });

  // `join` only walks a "\" out of the directory on Windows, so the stem is asserted rather than the platform's
  // Reading of it: either separator survives here and the clip lands wherever the socket asked for
  test.each(["../../target", "..\\..\\target"])("spends the stem %s on one name inside the dub", (stem) => {
    expect.hasAssertions();

    expect(getReferencePath(stem, VoiceLanguage.English)).toBe(join(languageDirectory, "..-..-target.ogg"));
  });
});
