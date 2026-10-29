import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { VerifyOutcome } from "#src/models/genshinParity/reference/VerifyOutcome";
import { cutRecordingFrame } from "#src/services/genshinParity/reference/cutRecordingFrame";
import { verifyReferences } from "#src/services/genshinParity/reference/verifyReferences";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { runFfmpeg } from "#src/services/recreation/video/runFfmpeg";
import { spawnSync } from "@esposter/shared-node/child-process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// The check runs FFmpeg on a synthetic video, so it is skipped where FFmpeg is not on the PATH
describe.skipIf(spawnSync("ffmpeg", ["-version"]).status !== 0)(verifyReferences, () => {
  const recordingName = `${TEST_FILENAME}.mp4`;
  const recordingSource = `${recordingName} at 1s`;
  let directory: string;

  // Cuts a reference of the synthetic recording's frame at one second, under the id it is given
  const cutReference = (referenceId: string): Promise<void> =>
    cutRecordingFrame(
      { file: recordingName, second: 1 },
      join(directory, recordingName),
      join(directory, `${referenceId}.png`),
    );
  const verifyAgainst = (references: Record<string, ParityReference>) =>
    verifyReferences(references, directory, (referenceId) => join(directory, `${referenceId}.png`));

  beforeAll(async () => {
    directory = mkdtempSync(join(tmpdir(), "parity-verify-test-"));
    await runFfmpeg([
      "-f",
      "lavfi",
      "-i",
      "testsrc=size=320x240:rate=10:duration=3",
      "-c:v",
      "mpeg4",
      join(directory, recordingName),
    ]);
  });

  afterAll(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("passes a reference cut from the frame its source names", async () => {
    expect.hasAssertions();

    await cutReference(TEST_FILENAME);

    expect(await verifyAgainst({ [TEST_FILENAME]: { screen: "screen", source: recordingSource } })).toStrictEqual([
      { id: TEST_FILENAME, message: "0.00% mean difference over 320×240", outcome: VerifyOutcome.Pass },
    ]);
  });

  test("fails a reference of a different picture", async () => {
    expect.hasAssertions();

    await runFfmpeg(["-f", "lavfi", "-i", "color=c=white:s=320x240", "-frames:v", "1", join(directory, "b.png")]);

    expect(
      (await verifyAgainst({ b: { screen: "screen", source: recordingSource } })).map(({ outcome }) => outcome),
    ).toStrictEqual([VerifyOutcome.Fail]);
  });

  test("fails a region that falls outside its reference's file", async () => {
    expect.hasAssertions();

    await cutReference("c");

    expect(
      await verifyAgainst({
        c: { region: { height: 240, width: 400, x: 0, y: 0 }, screen: "screen", source: recordingSource },
      }),
    ).toStrictEqual([
      { id: "c", message: "region 400×240 at 0, 0, outside its 320×240 file", outcome: VerifyOutcome.Fail },
    ]);
  });

  test("skips a reference whose recording is not on disk and names a wiki reference as not checkable", async () => {
    expect.hasAssertions();

    // A recording nested under a folder that does not exist, so it is not on disk
    const absentSource = `${TEST_FILENAME}/${recordingName} at 1s`;
    await cutReference("d");

    expect(
      (
        await verifyAgainst({
          d: { screen: "screen", source: absentSource },
          e: { screen: "screen", wikiTitle: TEST_FILENAME },
        })
      ).map(({ id, outcome }) => ({ id, outcome })),
    ).toStrictEqual([
      { id: "d", outcome: VerifyOutcome.Skipped },
      { id: "e", outcome: VerifyOutcome.NotCheckable },
    ]);
  });
});
