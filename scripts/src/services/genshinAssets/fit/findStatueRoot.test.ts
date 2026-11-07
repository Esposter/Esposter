import { findStatueRoot } from "#src/services/genshinAssets/fit/findStatueRoot";
import { describe, expect, test } from "vitest";

describe(findStatueRoot, () => {
  test("takes the Goddess stone mesh over the figure it holds", () => {
    expect.hasAssertions();

    const placements = [{ mesh: "Stages_MdGoddess_Lite01_Lod0" }, { mesh: "Stages_MdGoddess01_Base_Lod0" }];

    expect(findStatueRoot(placements)).toStrictEqual({ mesh: "Stages_MdGoddess01_Base_Lod0" });
  });

  test("finds no root where the only Goddess mesh is a figure", () => {
    expect.hasAssertions();

    expect(findStatueRoot([{ mesh: "Stages_MdGoddess_Lite01_Lod0" }])).toBeUndefined();
  });

  test("finds no root where no Goddess mesh is placed", () => {
    expect.hasAssertions();

    expect(findStatueRoot([{ mesh: "Area_Common_Build_Ruin_G_01_Lod0" }])).toBeUndefined();
  });
});
