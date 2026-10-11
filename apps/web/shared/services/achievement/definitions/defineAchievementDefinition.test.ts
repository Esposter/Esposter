import { MessageAchievementDefinitionMap } from "#shared/services/achievement/definitions/MessageAchievementDefinitionMap";
import { MessageAchievementName } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe("defineAchievementDefinition", () => {
  const roomId = "00000000-0000-4000-8000-000000000000";
  const timeZone = "UTC";
  const { check } = MessageAchievementDefinitionMap[MessageAchievementName.EssayWriter];
  // EssayWriter unlocks at 1,000 characters, so a message one short is the case the condition must reject
  const message = "a".repeat(1000);

  test("fires on valid input", () => {
    expect.hasAssertions();

    expect(check({ message, roomId, timeZone })).toBe(true);
  });

  test("does not fire when the condition is not met", () => {
    expect.hasAssertions();

    expect(check({ message: message.slice(1), roomId, timeZone })).toBe(false);
  });

  // A message with no body has no path to read, so the condition cannot be met
  test("does not fire when the path it reads is absent", () => {
    expect.hasAssertions();

    expect(check({ roomId, timeZone })).toBe(false);
  });

  // The raw room id is not a uuid, so the schema rejects the call before the condition is read
  test("does not fire when the input fails its schema", () => {
    expect.hasAssertions();

    expect(check({ message, roomId: "not-a-uuid", timeZone })).toBe(false);
  });
});
