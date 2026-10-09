import { hashFile } from "#src/services/genshinParity/reference/hashFile";
import { measureFrameSoftness } from "#src/services/genshinParity/reference/measureFrameSoftness";
import { CAPTURES_DIRECTORY, REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// The softness of each capture read this run, so a run over many references hashes each recording once
const captureSoftnessMap = new Map<string, number>();

// Measures a capture's frame into its cache file, so the next run reads it instead
const measureCapture = async (framePath: string, cachePath: string): Promise<number> => {
  const softness = await measureFrameSoftness(framePath);
  await writeFile(cachePath, String(softness));
  return softness;
};

// The Gaussian sigma of a capture video's own blur, measured off the first reference's frame taken from it and cached
// Beside the references under the file's hash, so a changed recording is measured again. Only a reference taken from a
// Recording asks for it: a still shot in the game is never softened
export const getCaptureSoftness = async (capture: string): Promise<number> => {
  const memoised = captureSoftnessMap.get(capture);
  if (memoised !== undefined) return memoised;
  const capturePath = join(CAPTURES_DIRECTORY, capture);
  if (!existsSync(capturePath))
    throw new InvalidOperationError(Operation.Read, capture, `no recording at ${capturePath}`);
  const referenceId = Object.keys(ParityReferenceMap).find((id) => ParityReferenceMap[id]?.capture === capture);
  if (referenceId === undefined)
    throw new InvalidOperationError(Operation.Read, capture, "no reference is taken from it");
  const cachePath = join(REFERENCES_DIRECTORY, `${capture}.softness-${await hashFile(capturePath)}.txt`);
  const softness = existsSync(cachePath)
    ? Number(await readFile(cachePath, "utf8"))
    : await measureCapture(join(REFERENCES_DIRECTORY, `${referenceId}.png`), cachePath);
  console.log(`${capture} softness ${softness.toFixed(3)} sigma`);
  captureSoftnessMap.set(capture, softness);
  return softness;
};
