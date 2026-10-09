import { selectArchitectureInView } from "#src/services/genshinAssets/world/selectArchitectureInView";
import { describe, expect, test } from "vitest";

describe(selectArchitectureInView, () => {
  const CAPITAL_PLACE = { x: 0, z: 0 };
  const ARCHITECTURE_NAME = "Area_MdBuild_Window57_Vo";
  const DECORATION_NAME = "Area_MdProps_Flower03_Vo";

  test("keeps architecture within the radius, and leaves out decoration there and architecture past it", () => {
    expect.hasAssertions();

    const architectureInRadius = { name: ARCHITECTURE_NAME, position: [550, 0, 0] as const };
    const architecturePastRadius = { name: ARCHITECTURE_NAME, position: [700, 0, 0] as const };
    const decorationInRadius = { name: DECORATION_NAME, position: [550, 0, 0] as const };

    expect(
      selectArchitectureInView([architectureInRadius, architecturePastRadius, decorationInRadius], CAPITAL_PLACE),
    ).toStrictEqual([architectureInRadius]);
  });
});
