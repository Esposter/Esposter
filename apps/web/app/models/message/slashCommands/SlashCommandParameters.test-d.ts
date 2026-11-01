import type { SlashCommandParameters } from "@/models/message/slashCommands/SlashCommandParameters";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("slashCommandParameters type", () => {
  // The accepted pairing below is what proves the refusal that follows can pass, so it stays
  test(SlashCommandType.Me, () => {
    expect.hasAssertions();

    expectTypeOf<SlashCommandParameters<SlashCommandType.Me>>().toEqualTypeOf<{ message: string }>();
  });

  test(`${SlashCommandType.Me} refuses an optional message`, () => {
    expect.hasAssertions();

    expectTypeOf<{ message?: string }>().not.toExtend<SlashCommandParameters<SlashCommandType.Me>>();
  });
});
