import type { Talk } from "#src/models/dialogue/Talk";

import DialogueTalk from "#src/components/Dialogue/Talk/Index.vue";
import { TalkLineKind } from "#src/models/dialogue/TalkLineKind";
import { LOGIN_TRAVELER_GENDER } from "#src/services/login/constants";
import { ENGLISH_GAME_TEXT, fillLinePlaceholders, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// A one-line talk whose line names the player and their twin's own word, held whole from its first frame, so what is
// Drawn is the line the game shows: the Traveler's title as the login fills it, then the female twin's word
describe("dialogueTalk", () => {
  test("should fill the player into the line", async () => {
    expect.hasAssertions();

    const talk: Talk = {
      id: "placeholders",
      lines: [
        {
          id: "line",
          kind: TalkLineKind.Spoken,
          nextLineIds: [],
          speakerRoleTextId: "",
          speakerTextId: "sara",
          textId: "line",
          voiceId: "",
        },
      ],
      startLineId: "line",
    };
    const travelerTitle = fillLinePlaceholders(ENGLISH_GAME_TEXT[GameTextKey.Traveler], "", LOGIN_TRAVELER_GENDER);
    render(DialogueTalk, {
      props: {
        gameText: ENGLISH_GAME_TEXT,
        startProgress: { isRevealed: true, lineId: "line" },
        talk,
        textMap: { line: "{NICKNAME}, {M#he}{F#she} said.", sara: "Sara" },
      },
    });

    // The line is drawn twice, the written-out copy hidden from a screen reader and the whole line once for it, last
    await expect.element(page.getByText(`${travelerTitle}, she said.`, { exact: true }).last()).toBeVisible();
  });
});
