import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { genshinParityCommand } from "#src/services/genshinParity/commands/genshinParityCommand";
import { compareScreen } from "#src/services/genshinParity/reference/compareScreen";
import { DEFAULT_APPROVAL } from "#src/services/genshinParity/reference/constants";
import { runCommand } from "citty";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinParity/reference/compareScreen"), () => ({
  compareScreen: vi.fn<typeof compareScreen>(),
}));
vi.mock(import("#src/services/genshinParity/page/startFreshPageServer"), () => ({
  startFreshPageServer: vi.fn<() => Promise<undefined>>(),
}));
vi.mock(import("#src/services/genshinParity/reference/getMissingReferenceInputs"), () => ({
  getMissingReferenceInputs: vi.fn<() => string[]>(() => []),
}));
// The manifest holds login-door, whose image is measured from this path rather than fetched
vi.mock(import("#src/services/genshinParity/reference/readReferenceManifest"), () => ({
  readReferenceManifest: vi.fn<() => Promise<ParityReferenceManifestRow[]>>(() =>
    Promise.resolve([
      {
        attribution: {},
        bytes: 1,
        capturedAt: new Date(0).toISOString(),
        height: 1,
        id: "login-door",
        kind: ParityReferenceKind.Wiki,
        sha256: "0".repeat(64),
        sourceFormat: "webp",
        width: 1,
      },
    ]),
  ),
}));
vi.mock(import("#src/services/genshinParity/reference/readCachedReference"), () => ({
  readCachedReference: vi.fn<() => Promise<string>>(() => Promise.resolve("")),
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

const cell = (column: number, error: number) => ({
  cell: [column, 0] as [number, number],
  error,
  ours: [1, 2, 3] as [number, number, number],
  reference: [4, 5, 6] as [number, number, number],
});

describe("compareCommand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("compares every scored reference and names a pending one as pending, scoring none of it", async () => {
    expect.hasAssertions();

    const error = vi.spyOn(console, "error").mockReturnValue(undefined);
    vi.spyOn(console, "log").mockReturnValue(undefined);
    vi.mocked(compareScreen).mockResolvedValue({
      cells: [],
      score: { edgeScore: 0, flip: 0, layers: [], meanDifference: 0, screen: "LoginScreen", toneDifference: 0 },
    });
    await runCommand(genshinParityCommand, { rawArgs: ["compare", "--all"] });

    expect(vi.mocked(compareScreen).mock.calls.map(([referenceId]) => referenceId)).toStrictEqual(["login-door"]);
    expect(error).toHaveBeenCalledWith("pending: no recording yet");
  });

  test("prints each comparison as one JSON line naming as many worst cells as --cells asks for", async () => {
    expect.hasAssertions();

    const log = vi.spyOn(console, "log").mockReturnValue(undefined);
    vi.spyOn(console, "error").mockReturnValue(undefined);
    vi.mocked(compareScreen).mockResolvedValue({
      cells: [cell(0, 1), cell(1, 9), cell(2, 4)],
      score: { edgeScore: 0, flip: 0, layers: [], meanDifference: 3.456, screen: "LoginScreen", toneDifference: 0 },
    });
    await runCommand(genshinParityCommand, { rawArgs: ["compare", "login-door", "--cells", "2"] });

    expect(log).toHaveBeenLastCalledWith(
      JSON.stringify({ bar: DEFAULT_APPROVAL.bar, id: "login-door", score: 3.46, worst: [cell(1, 9), cell(2, 4)] }),
    );
  });
});
