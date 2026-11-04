import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { getVisualMoveTargets } from "@/services/dashboard/visual/getVisualMoveTargets";
import { describe, expect, test } from "vitest";

describe("getVisualMoveTargets", () => {
  // A chain of four groups reaches the depth cap at the fourth, which holds visuals but no group
  const level3 = new Visual({ type: VisualType.Group, visuals: [] });
  const level2 = new Visual({ type: VisualType.Group, visuals: [level3] });
  const level1 = new Visual({ type: VisualType.Group, visuals: [level2] });
  const level0 = new Visual({ type: VisualType.Group, visuals: [level1] });
  const sales = new Visual({ type: VisualType.Group, visuals: [], x: 4 });
  sales.chart.configuration.title = "Sales";
  const innerGroup = new Visual({ type: VisualType.Group, visuals: [] });
  const card = new Visual({ type: VisualType.Card });
  const outer = new Visual({ type: VisualType.Group, visuals: [card, innerGroup] });
  const tree = [outer, sales, level0];

  test("a visual offers the dashboard and every group outside its own list", () => {
    expect.hasAssertions();

    expect(getVisualMoveTargets(tree, card.id)).toStrictEqual([
      { title: "Dashboard", value: "" },
      { title: "Untitled group", value: innerGroup.id },
      { title: "Sales", value: sales.id },
      { title: "Untitled group", value: level0.id },
      { title: "Untitled group", value: level1.id },
      { title: "Untitled group", value: level2.id },
      { title: "Untitled group", value: level3.id },
    ]);
  });

  // A group keeps out of its own subtree, and of any group it would take past the cap with the groups it holds: the inner
  // Group sits one level below it, so a group at the second level would carry it to the fourth
  test("a group offers no group inside it and no group at the depth cap", () => {
    expect.hasAssertions();

    expect(getVisualMoveTargets(tree, outer.id)).toStrictEqual([
      { title: "Sales", value: sales.id },
      { title: "Untitled group", value: level0.id },
      { title: "Untitled group", value: level1.id },
    ]);
  });
});
