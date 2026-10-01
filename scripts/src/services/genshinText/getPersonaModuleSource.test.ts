import {
  CHARACTER_LINES_DIRECTORY,
  GENSHIN_TEXT_GENERATED_DIRECTORY,
  GENSHIN_TEXT_SOURCE_DIRECTORY,
  PERSONA_COPY_DIRECTORY,
  PersonaCopiedModules,
} from "#src/services/genshinText/constants";
import { getCharacterLinesLoaderMapSource } from "#src/services/genshinText/getCharacterLinesLoaderMapSource";
import { getGameTextLoaderMapSource } from "#src/services/genshinText/getGameTextLoaderMapSource";
import { getPersonaModuleSource } from "#src/services/genshinText/getPersonaModuleSource";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";

// The persona runs a copy of `genshin-text` rather than the package, so the one way the two drift is an edit to the
// Source with no `genshin:text write` after it, or an edit to the copy by hand. Either fails here, as does a loader
// Map the writer would no longer write. Generated output is never formatted, so each is compared byte for byte
describe(getPersonaModuleSource, () => {
  test("re-aims the package's alias at the copy, headed as the copy it is", () => {
    expect.hasAssertions();

    expect(getPersonaModuleSource(`import { a } from "#src/a";\n`)).toBe(
      "// Copied from `genshin-text` by `pnpm -C scripts genshin:text write`, never edited by hand\n" +
        `import { a } from "#src/generated/genshinText/a";\n`,
    );
  });

  test.each(PersonaCopiedModules)("the persona's copy of %s is the source's", (modulePath) => {
    expect.hasAssertions();

    const source = readFileSync(join(GENSHIN_TEXT_SOURCE_DIRECTORY, modulePath), "utf8");

    expect(readFileSync(join(PERSONA_COPY_DIRECTORY, modulePath), "utf8")).toBe(getPersonaModuleSource(source));
  });

  test("the loader maps are the ones the writer writes", () => {
    expect.hasAssertions();

    expect(readFileSync(join(GENSHIN_TEXT_GENERATED_DIRECTORY, "GameTextLoaderMap.ts"), "utf8")).toBe(
      getGameTextLoaderMapSource(),
    );
    expect(readFileSync(join(dirname(CHARACTER_LINES_DIRECTORY), "CharacterLinesLoaderMap.ts"), "utf8")).toBe(
      getCharacterLinesLoaderMapSource(),
    );
  });
});
