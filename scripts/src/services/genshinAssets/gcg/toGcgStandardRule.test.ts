import type { ExcelGcgElementReactionRow } from "#src/models/genshinAssets/gcg/ExcelGcgElementReactionRow";
import type { ExcelGcgRuleRow } from "#src/models/genshinAssets/gcg/ExcelGcgRuleRow";

import { toGcgStandardRule } from "#src/services/genshinAssets/gcg/toGcgStandardRule";
import { Element } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toGcgStandardRule, () => {
  const DRAW_COUNT = 2;
  const HAND_CARD_LIMIT = 10;
  const CRYO_PYRO_REACTION_ID = 101;
  const ANEMO_CRYO_REACTION_ID = 107;
  const reactionRows: ExcelGcgElementReactionRow[] = [
    { elementType1: "GCG_ELEMENT_CRYO", elementType2: "GCG_ELEMENT_PYRO", id: CRYO_PYRO_REACTION_ID },
    { elementType1: "GCG_ELEMENT_ANEMO", elementType2: "GCG_ELEMENT_CRYO", id: ANEMO_CRYO_REACTION_ID },
  ];

  test("should read the draw count, hand limit and each listed reaction's element pair as the world's Element enum", () => {
    expect.hasAssertions();

    const ruleRow: ExcelGcgRuleRow = {
      drawCardNum: DRAW_COUNT,
      elementReactionList: [CRYO_PYRO_REACTION_ID, ANEMO_CRYO_REACTION_ID],
      handCardLimit: HAND_CARD_LIMIT,
      id: 2,
    };

    expect(toGcgStandardRule(ruleRow, reactionRows)).toStrictEqual({
      drawCount: DRAW_COUNT,
      handCardLimit: HAND_CARD_LIMIT,
      reactions: [
        { elements: [Element.Cryo, Element.Pyro], id: CRYO_PYRO_REACTION_ID },
        { elements: [Element.Anemo, Element.Cryo], id: ANEMO_CRYO_REACTION_ID },
      ],
    });
  });

  test("should refuse a rule that lists a reaction the reaction table does not hold", () => {
    expect.hasAssertions();

    const ruleRow: ExcelGcgRuleRow = {
      drawCardNum: DRAW_COUNT,
      elementReactionList: [CRYO_PYRO_REACTION_ID, 999],
      handCardLimit: HAND_CARD_LIMIT,
      id: 2,
    };

    expect(() => toGcgStandardRule(ruleRow, reactionRows)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: standard rule, rule 2 lists reaction 999, which the reaction table does not hold]`,
    );
  });
});
