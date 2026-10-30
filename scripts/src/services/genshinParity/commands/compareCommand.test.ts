import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { ParityReportRun } from "#src/models/genshinParity/reference/ParityReportRun";
import { genshinParityCommand } from "#src/services/genshinParity/commands/genshinParityCommand";
import { compareScreen } from "#src/services/genshinParity/reference/compareScreen";
import { DEFAULT_APPROVAL } from "#src/services/genshinParity/reference/constants";
import { writeParityScores } from "#src/services/genshinParity/reference/writeParityScores";
import { REFERENCE_MANIFEST_PATH } from "#src/services/genshinParity/shared/constants";
import { getPlannedReferencePath } from "#src/services/genshinParity/shared/getPlannedReferencePath";
import { getReferencePlateFilePath } from "#src/services/genshinParity/shared/getReferencePlateFilePath";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runCommand } from "citty";
import { join, relative } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinParity/reference/compareScreen"), () => ({
  compareScreen: vi.fn<typeof compareScreen>(),
}));
vi.mock(import("#src/services/genshinParity/page/startFreshPageServer"), () => ({
  startFreshPageServer: vi.fn<() => Promise<undefined>>(),
}));
// login-door's committed image is the manifest's own file, which is on disk, so `compare --all` measures it
vi.mock(import("#src/services/genshinParity/shared/getPlannedReferencePath"), () => ({
  getPlannedReferencePath: vi.fn<(referenceId: string) => Promise<string>>(() =>
    Promise.resolve(REFERENCE_MANIFEST_PATH),
  ),
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
      {
        attribution: {},
        bytes: 1,
        capturedAt: new Date(0).toISOString(),
        height: 1,
        id: "plate-door",
        kind: ParityReferenceKind.RecordingFrame,
        plate: { bytes: 1, height: 1, sha256: "1".repeat(64), width: 1 },
        sha256: "0".repeat(64),
        sourceFormat: "webp",
        width: 1,
      },
    ]),
  ),
}));
vi.mock(import("#src/services/genshinParity/reference/writeParityScores"), () => ({
  writeParityScores: vi.fn<typeof writeParityScores>(),
}));
vi.mock(import("#src/services/genshinParity/shared/fetchReferences"), () => ({
  fetchReferences: vi.fn<() => Promise<void>>(),
}));
vi.mock(import("#src/services/genshinParity/shared/ParityReferenceMap"), () => ({
  ParityReferenceMap: {
    "cooking-screen": { pending: "no recording yet", screen: "CookingScreen" },
    "login-door": { screen: "LoginScreen", wikiTitle: "File:Door.png" },
    "plate-door": { plateSource: "plate frame at 2s", screen: "DoorScreen", source: "main frame at 1s" },
  } satisfies Record<string, ParityReference>,
}));

const cell = (column: number, error: number) => ({
  cell: [column, 0] as [number, number],
  error,
  ours: [1, 2, 3] as [number, number, number],
  reference: [4, 5, 6] as [number, number, number],
});

describe("compareCommand", () => {
  const loginDoorScore = {
    edgeScore: 0,
    flip: 0,
    layers: [],
    meanDifference: 0,
    screen: "LoginScreen",
    toneDifference: 0,
  };

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
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

  test("writes a single reference's compare as a subset run, which never drops another row", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockReturnValue(undefined);
    vi.spyOn(console, "log").mockReturnValue(undefined);
    vi.mocked(compareScreen).mockResolvedValue({ cells: [], score: loginDoorScore });
    await runCommand(genshinParityCommand, { rawArgs: ["compare", "login-door"] });

    expect(vi.mocked(writeParityScores)).toHaveBeenLastCalledWith(
      { "login-door": loginDoorScore },
      ParityReportRun.Subset,
    );
  });

  test("names a committed image that is missing, writes the run's scores and fails the run, rather than aborting it", async () => {
    expect.hasAssertions();

    const error = vi.spyOn(console, "error").mockReturnValue(undefined);
    vi.spyOn(console, "log").mockReturnValue(undefined);
    vi.mocked(getPlannedReferencePath).mockResolvedValueOnce(join(REPOSITORY_ROOT, "missing", "login-door.webp"));
    await runCommand(genshinParityCommand, { rawArgs: ["compare", "--all"] });

    expect(vi.mocked(compareScreen)).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(`missing committed image: login-door: ${join("missing", "login-door.webp")}`);
    expect(vi.mocked(writeParityScores)).toHaveBeenLastCalledWith({}, ParityReportRun.Full);
    expect(process.exitCode).toBe(1);
  });

  test("writes --all's compare as the full run, the one run that may drop a row", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockReturnValue(undefined);
    vi.spyOn(console, "log").mockReturnValue(undefined);
    vi.mocked(compareScreen).mockResolvedValue({ cells: [], score: loginDoorScore });
    await runCommand(genshinParityCommand, { rawArgs: ["compare", "--all"] });

    expect(vi.mocked(writeParityScores)).toHaveBeenLastCalledWith(
      { "login-door": loginDoorScore },
      ParityReportRun.Full,
    );
  });

  test("names a committed plate that is missing, scores the others, and fails the run", async () => {
    expect.hasAssertions();

    const error = vi.spyOn(console, "error").mockReturnValue(undefined);
    vi.spyOn(console, "log").mockReturnValue(undefined);
    vi.mocked(compareScreen).mockResolvedValue({ cells: [], score: loginDoorScore });
    await runCommand(genshinParityCommand, { rawArgs: ["compare", "--all"] });

    expect(vi.mocked(compareScreen).mock.calls.map(([referenceId]) => referenceId)).toStrictEqual(["login-door"]);
    expect(error).toHaveBeenCalledWith(
      `missing committed image: plate-door: ${relative(REPOSITORY_ROOT, getReferencePlateFilePath("plate-door"))}`,
    );
    expect(vi.mocked(writeParityScores)).toHaveBeenLastCalledWith(
      { "login-door": loginDoorScore },
      ParityReportRun.Full,
    );
    expect(process.exitCode).toBe(1);
  });
});
