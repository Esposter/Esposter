import type { Talk } from "#src/models/dialogue/Talk";

import DialogueTalk from "#src/components/Dialogue/Talk/Index.vue";
import { TalkLineKind } from "#src/models/dialogue/TalkLineKind";
import { LOGIN_TRAVELER_GENDER } from "#src/services/login/constants";
import { DialogueChoiceIcon } from "genshin-interface";
import { ENGLISH_GAME_TEXT, fillLinePlaceholders, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("dialogueTalk", () => {
  const spokenLine = {
    kind: TalkLineKind.Spoken as const,
    nextLineIds: [],
    speakerRoleTextId: "",
    speakerTextId: "sara",
    voiceId: "",
  };
  const talk: Talk = {
    id: "standing",
    lines: [{ ...spokenLine, id: "line", textId: "line" }],
    npcIds: [],
    startLineId: "line",
  };

  // A one-line talk whose line names the player and their twin's own word, held whole from its first frame, so what is
  // Drawn is the line the game shows: the Traveler's title as the login fills it, then the female twin's word
  test("should fill the player into the line", async () => {
    expect.hasAssertions();

    const travelerTitle = fillLinePlaceholders(ENGLISH_GAME_TEXT[GameTextKey.Traveler], "", LOGIN_TRAVELER_GENDER);
    await render(DialogueTalk, {
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

  // A resident's one-line standing talk offering a quest talk on its whole opening line, which a click on the reply
  // Leaves for the quest's talk
  test("should begin the quest talk its opening line offers", async () => {
    expect.hasAssertions();

    const onBegin = vi.fn<(talkId: string) => void>();
    await render(DialogueTalk, {
      props: {
        gameText: ENGLISH_GAME_TEXT,
        offers: [{ icon: DialogueChoiceIcon.Quest, talkId: "quest", textId: "title" }],
        onBegin,
        startProgress: { isRevealed: true, lineId: "line" },
        talk,
        textMap: { line: "Hello.", sara: "Sara", title: "A Quest" },
      },
    });
    await page.getByText("A Quest", { exact: true }).click();

    expect(onBegin).toHaveBeenCalledExactlyOnceWith("quest");
  });

  // A two-line standing talk whose opening line offers a quest talk and no reply of its own, which a click on the line
  // Takes on to the second line rather than holding for the offer
  test("should go on past the opening line's offers", async () => {
    expect.hasAssertions();

    const twoLineTalk: Talk = {
      id: "standing",
      lines: [
        { ...spokenLine, id: "first", nextLineIds: ["second"], textId: "first" },
        { ...spokenLine, id: "second", textId: "second" },
      ],
      npcIds: [],
      startLineId: "first",
    };
    await render(DialogueTalk, {
      props: {
        gameText: ENGLISH_GAME_TEXT,
        offers: [{ icon: DialogueChoiceIcon.Quest, talkId: "quest", textId: "title" }],
        startProgress: { isRevealed: true, lineId: "first" },
        talk: twoLineTalk,
        textMap: { first: "Hello.", sara: "Sara", second: "Goodbye.", title: "A Quest" },
      },
    });
    await page.getByText("Hello.", { exact: true }).last().click();

    await expect.element(page.getByText("Goodbye.", { exact: true }).last()).toBeInTheDocument();
  });
});
