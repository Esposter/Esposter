import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { genshinParityCommand } from "#src/services/genshinParity/commands/genshinParityCommand";
import { compareScreen } from "#src/services/genshinParity/reference/compareScreen";
import { runCommand } from "citty";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinParity/reference/compareScreen"), () => ({
  compareScreen: vi.fn<typeof compareScreen>(),
}));
vi.mock(import("#src/services/genshinParity/reference/getMissingReferenceInputs"), () => ({
  getMissingReferenceInputs: vi.fn<() => string[]>(() => []),
}));
vi.mock(import("#src/services/genshinParity/reference/writeParityScores"), () => ({
  writeParityScores: vi.fn<() => Promise<void>>(),
}));
vi.mock(import("#src/services/genshinParity/shared/fetchReferences"), () => ({
  fetchReferences: vi.fn<() => Promise<void>>(),
}));
vi.mock(import("#src/services/genshinParity/shared/ParityReferenceMap"), () => ({
  ParityReferenceMap: {
    "cooking-screen": { pending: "no recording yet", screen: "CookingScreen" },
    "login-door": { screen: "LoginScreen", wikiTitle: "File:Door.png" },
  } satisfies Record<string, ParityReference>,
}));

describe("compareCommand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("compares every scored reference and names a pending one as pending, scoring none of it", async () => {
    expect.hasAssertions();

    const log = vi.spyOn(console, "log").mockReturnValue(undefined);
    vi.mocked(compareScreen).mockResolvedValue({
      edgeScore: 0,
      flip: 0,
      layers: [],
      meanDifference: 0,
      screen: "LoginScreen",
      toneDifference: 0,
    });
    await runCommand(genshinParityCommand, { rawArgs: ["compare", "--all"] });

    expect(vi.mocked(compareScreen).mock.calls.map(([referenceId]) => referenceId)).toStrictEqual(["login-door"]);
    expect(log).toHaveBeenCalledWith("pending: no recording yet");
  });
});
