import { createTeleportCommand } from "#src/services/dev/commands/createTeleportCommand";
import { createTimeCommand } from "#src/services/dev/commands/createTimeCommand";
import { giveItemArgs } from "#src/services/dev/commands/giveItem";
import { DEV_CATALOGUE } from "#src/services/dev/constants.test";
import { createDevRegistry } from "#src/services/dev/createDevRegistry";
import { DEV_SCENARIOS } from "#src/services/dev/scenarios/constants";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("dEV_SCENARIOS", () => {
  test.each(DEV_SCENARIOS)("$name runs every line to success through the registry", (scenario) => {
    expect.hasAssertions();

    const registry = createDevRegistry();
    registry.register({
      commands: [
        createTeleportCommand({ catalogue: DEV_CATALOGUE, getLandmarks: () => [], jumpTo: () => undefined }),
        createTimeCommand({ getGameClock: () => ({ minutes: 0, minutesPerSecond: 0 }) }),
        { args: giveItemArgs, argumentNames: ["item", "count"], name: "give", run: () => ({ ok: true, value: 0 }) },
        { args: z.object({}), argumentNames: [], name: "heal", run: () => ({ ok: true, value: 0 }) },
      ],
      variables: [],
    });

    expect(registry.runScenario(scenario)).toStrictEqual({ ok: true, value: scenario.lines.length });
  });
});
