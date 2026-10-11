import { saveClickerInputSchema } from "#shared/models/db/clicker/SaveClickerInput";
import { zonedCreateMessageInputSchema } from "#shared/models/db/message/ZonedCreateMessageInput";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { describe, expect, expectTypeOf, test } from "vitest";

describe(defineAchievementDefinition, () => {
  test("accepts a predicate whose path and value belong to the trigger's input", () => {
    expect.hasAssertions();

    const definition = defineAchievementDefinition({
      condition: property("message", length(isAtLeast(1000))),
      description: "",
      icon: "",
      inputSchema: zonedCreateMessageInputSchema,
      points: 0,
      triggerPath: "message.createMessage",
    });

    expectTypeOf(definition.check).toBeFunction();
  });

  test("rejects a schema that belongs to another procedure", () => {
    expect.hasAssertions();

    defineAchievementDefinition({
      description: "",
      icon: "",
      // @ts-expect-error the clicker save schema is not the input of the message trigger
      inputSchema: saveClickerInputSchema,
      points: 0,
      triggerPath: "message.createMessage",
    });
  });

  test("rejects a path the trigger's input does not have", () => {
    expect.hasAssertions();

    defineAchievementDefinition({
      // @ts-expect-error data.pointCount is not a path of the message trigger's input
      condition: property("data.pointCount", isAtLeast(1)),
      description: "",
      icon: "",
      inputSchema: zonedCreateMessageInputSchema,
      points: 0,
      triggerPath: "message.createMessage",
    });
  });

  test("rejects an operator whose value type does not match the path", () => {
    expect.hasAssertions();

    defineAchievementDefinition({
      // @ts-expect-error isAtLeast compares a number, and message is a string
      condition: property("message", isAtLeast(1)),
      description: "",
      icon: "",
      inputSchema: zonedCreateMessageInputSchema,
      points: 0,
      triggerPath: "message.createMessage",
    });
  });
});
