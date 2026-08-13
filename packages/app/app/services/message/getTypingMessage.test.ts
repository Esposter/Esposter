import { getTypingMessage } from "@/services/message/getTypingMessage";
import { describe, expect, test } from "vitest";

describe(getTypingMessage, () => {
  const firstUsername = "firstUsername";
  const secondUsername = "secondUsername";

  test("nobody typing", () => {
    expect.hasAssertions();

    expect(getTypingMessage([])).toBe("");
  });

  test("one typing", () => {
    expect.hasAssertions();

    expect(getTypingMessage([firstUsername])).toBe(`${firstUsername} is typing...`);
  });

  test("two typing", () => {
    expect.hasAssertions();

    expect(getTypingMessage([firstUsername, secondUsername])).toBe(
      `${firstUsername} and ${secondUsername} are typing...`,
    );
  });

  // Past two the names stop earning their room in a one-line status
  test("several typing", () => {
    expect.hasAssertions();

    expect(getTypingMessage([firstUsername, secondUsername, "thirdUsername"])).toBe("Several people are typing...");
  });
});
