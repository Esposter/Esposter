import { saveClickerInputSchema } from "#shared/models/db/clicker/SaveClickerInput";
import { saveDungeonsInputSchema } from "#shared/models/db/dungeons/SaveDungeonsInput";
import { zonedCreateMessageInputSchema } from "#shared/models/db/message/ZonedCreateMessageInput";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";
import {
  defineAchievementDefinition,
  defineTriggerAchievementDefinition,
} from "#shared/services/achievement/definitions/defineAchievementDefinition";
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

  // A factory binds the schema once, so the check against the trigger must survive the second generic layer
  test("rejects a schema that belongs to another procedure when the trigger is bound once", () => {
    expect.hasAssertions();

    // @ts-expect-error the clicker save schema is not the input of the message trigger
    defineTriggerAchievementDefinition("message.createMessage", saveClickerInputSchema);
  });

  // A save is the client's own account of its game, so a definition bound to one carries no points to inflate
  test("rejects points on a trigger whose input is a client's own save", () => {
    expect.hasAssertions();

    const defineDungeonsAchievementDefinition = defineTriggerAchievementDefinition(
      "dungeons.saveDungeons",
      saveDungeonsInputSchema,
    );
    const { points } = defineDungeonsAchievementDefinition({ description: "", icon: "", points: 0 });

    expectTypeOf(points).toEqualTypeOf<0>();

    defineDungeonsAchievementDefinition({
      description: "",
      icon: "",
      // @ts-expect-error a claimed trigger's points are typed 0
      points: 1,
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
