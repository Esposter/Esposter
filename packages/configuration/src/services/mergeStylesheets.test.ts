import { mergeStylesheets } from "#src/services/mergeStylesheets";
import { describe, expect, test } from "vitest";

describe(mergeStylesheets, () => {
  const board = { id: "components/Board/Index.css", source: ".board{}\n" };
  const card = { id: "components/Card/Index.css", source: ".card{}\n" };
  const menu = { id: "components/Menu/Index.css", source: ".menu{}\n" };

  test("gives the same bytes whichever order the stylesheets arrive in", () => {
    expect.hasAssertions();

    expect(mergeStylesheets([card, menu, board])).toBe(mergeStylesheets([board, menu, card]));
  });

  test("joins the stylesheets in module-id order", () => {
    expect.hasAssertions();

    expect(mergeStylesheets([menu, card, board])).toBe(".board{}\n.card{}\n.menu{}\n");
  });
});
