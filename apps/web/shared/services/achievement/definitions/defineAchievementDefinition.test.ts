import { zonedCreateMessageInputSchema } from "#shared/models/db/message/ZonedCreateMessageInput";
import { defineTriggerAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { MessageAchievementDefinitionMap } from "#shared/services/achievement/definitions/MessageAchievementDefinitionMap";
import { MessageAchievementName } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe("defineAchievementDefinition", () => {
  const roomId = "00000000-0000-4000-8000-000000000000";
  const timeZone = "UTC";
  const { check } = MessageAchievementDefinitionMap[MessageAchievementName.EssayWriter];
  // EssayWriter unlocks at 1,000 characters, so a message one short is the case the condition must reject
  const message = "a".repeat(1000);

  // A map bound once to its trigger hands each entry the trigger and the schema it was bound with
  test("binds the trigger and its schema into every definition it makes", () => {
    expect.hasAssertions();

    const defineMessageAchievementDefinition = defineTriggerAchievementDefinition(
      "message.createMessage",
      zonedCreateMessageInputSchema,
    );
    const { check: checkBound, triggerPath } = defineMessageAchievementDefinition({
      description: "",
      icon: "",
      points: 0,
    });

    expect(triggerPath).toBe("message.createMessage");
    expect(checkBound({ message, roomId, timeZone })).toBe(true);
  });

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
