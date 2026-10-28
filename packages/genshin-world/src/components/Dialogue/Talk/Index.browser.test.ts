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
  // A one-line talk whose line names the player and their twin's own word, held whole from its first frame, so what is
  // Drawn is the line the game shows: the Traveler's title as the login fills it, then the female twin's word
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
      npcIds: [],
      startLineId: "line",
    };
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

    const talk: Talk = {
      id: "standing",
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
      npcIds: [],
      startLineId: "line",
    };
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

    const talk: Talk = {
      id: "standing",
      lines: [
        {
          id: "first",
          kind: TalkLineKind.Spoken,
          nextLineIds: ["second"],
          speakerRoleTextId: "",
          speakerTextId: "sara",
          textId: "first",
          voiceId: "",
        },
        {
          id: "second",
          kind: TalkLineKind.Spoken,
          nextLineIds: [],
          speakerRoleTextId: "",
          speakerTextId: "sara",
          textId: "second",
          voiceId: "",
        },
      ],
      npcIds: [],
      startLineId: "first",
    };
    await render(DialogueTalk, {
      props: {
        gameText: ENGLISH_GAME_TEXT,
        offers: [{ icon: DialogueChoiceIcon.Quest, talkId: "quest", textId: "title" }],
        startProgress: { isRevealed: true, lineId: "first" },
        talk,
        textMap: { first: "Hello.", sara: "Sara", second: "Goodbye.", title: "A Quest" },
      },
    });
    await page.getByText("Hello.", { exact: true }).last().click();

    await expect.element(page.getByText("Goodbye.", { exact: true }).last()).toBeInTheDocument();
  });
});
