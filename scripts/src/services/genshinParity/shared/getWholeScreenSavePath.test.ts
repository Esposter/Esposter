import { getWholeScreenSavePath } from "#src/services/genshinParity/shared/getWholeScreenSavePath";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(getWholeScreenSavePath, () => {
  test("names the file its title without the File namespace, spaces as underscores, keeping its extension", () => {
    expect.hasAssertions();

    expect(getWholeScreenSavePath("screens", "File:Archive Menu Home 1.png")).toStrictEqual(
      join("screens", "Archive_Menu_Home_1.png"),
    );
  });

  test("keeps a title with no File namespace as it is, underscored", () => {
    expect.hasAssertions();

    expect(getWholeScreenSavePath("screens", "Archive Menu.webp")).toStrictEqual(join("screens", "Archive_Menu.webp"));
  });
});
