import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("slashCommandParameters type", () => {
  test(SlashCommandType.Flip, () => {
    expect.hasAssertions();

    expectTypeOf<SlashCommandParameters<SlashCommandType.Flip>>().toEqualTypeOf<{}>();
  });

  test(SlashCommandType.Me, () => {
    expect.hasAssertions();

    expectTypeOf<SlashCommandParameters<SlashCommandType.Me>>().toEqualTypeOf<{ message: string }>();
  });

  test(SlashCommandType.Shrug, () => {
    expect.hasAssertions();

    expectTypeOf<SlashCommandParameters<SlashCommandType.Shrug>>().toEqualTypeOf<{ text?: string }>();
  });
});
