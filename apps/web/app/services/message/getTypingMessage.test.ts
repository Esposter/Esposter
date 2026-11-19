import { getTypingMessage } from "#src/services/message/getTypingMessage";
import { describe, expect, test } from "vitest";

describe(getTypingMessage, () => {
  const firstUsername = "firstUsername";
  const secondUsername = "secondUsername";

  // Past two the names stop earning their room in a one-line status
  test.each([
    { expected: "", title: "shows no status when nobody is typing", usernames: [] },
    { expected: `${firstUsername} is typing...`, title: "names the one person typing", usernames: [firstUsername] },
    {
      expected: `${firstUsername} and ${secondUsername} are typing...`,
      title: "names both people typing",
      usernames: [firstUsername, secondUsername],
    },
    {
      expected: "Several people are typing...",
      title: "collapses three or more typists into one status",
      usernames: [firstUsername, secondUsername, "thirdUsername"],
    },
  ])("$title", ({ expected, usernames }) => {
    expect.hasAssertions();

    expect(getTypingMessage(usernames)).toBe(expected);
  });
});
