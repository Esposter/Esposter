import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { getVisualMoveTargets } from "@/services/dashboard/visual/getVisualMoveTargets";
import { describe, expect, test } from "vitest";

describe(getVisualMoveTargets, () => {
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

  // The untitled groups share one label, so the first keeps it and each later one takes the next number, in tree order
  test("a visual offers the dashboard and every group outside its own list, numbering a repeated title", () => {
    expect.hasAssertions();

    expect(getVisualMoveTargets(tree, card.id)).toStrictEqual([
      { title: "Dashboard", value: "" },
      { title: "Untitled group", value: innerGroup.id },
      { title: "Sales", value: sales.id },
      { title: "Untitled group 2", value: level0.id },
      { title: "Untitled group 3", value: level1.id },
      { title: "Untitled group 4", value: level2.id },
      { title: "Untitled group 5", value: level3.id },
    ]);
  });

  // A group keeps out of its own subtree, and out of any group a move into it would carry a group it holds past the depth
  // Cap: the inner group sits one level below the outer one, so the third level of the chain takes it past the cap
  test("a group offers no group inside it and no group that would nest it past the cap", () => {
    expect.hasAssertions();

    expect(getVisualMoveTargets(tree, outer.id)).toStrictEqual([
      { title: "Sales", value: sales.id },
      { title: "Untitled group", value: level0.id },
      { title: "Untitled group 2", value: level1.id },
    ]);
  });

  // A numbered label never equals a title another group holds, so the literal "Sales 2" keeps its own label and the repeated
  // "Sales" takes the next free number
  test("a numbered label skips a title another group already holds", () => {
    expect.hasAssertions();

    const firstSales = new Visual({ type: VisualType.Group, visuals: [] });
    firstSales.chart.configuration.title = "Sales";
    const secondSales = new Visual({ type: VisualType.Group, visuals: [] });
    secondSales.chart.configuration.title = "Sales";
    const literalSales2 = new Visual({ type: VisualType.Group, visuals: [] });
    literalSales2.chart.configuration.title = "Sales 2";
    const looseCard = new Visual({ type: VisualType.Card });
    const numbered = [looseCard, firstSales, secondSales, literalSales2];

    expect(getVisualMoveTargets(numbered, looseCard.id)).toStrictEqual([
      { title: "Sales", value: firstSales.id },
      { title: "Sales 3", value: secondSales.id },
      { title: "Sales 2", value: literalSales2.id },
    ]);
  });
});
