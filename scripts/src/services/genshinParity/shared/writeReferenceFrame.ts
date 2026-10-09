import { CAPTURES_DIRECTORY, REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getCaptureUrl } from "#src/services/genshinParity/shared/getCaptureUrl";
import { writeCaptureFrame } from "#src/services/genshinParity/shared/writeCaptureFrame";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// One frame of a capture in captures, written into `references/<name>/` as `<seconds>s.png` beside a SOURCE.txt that
// Names the video it came from, or the recording, and the second it was taken at
export const writeReferenceFrame = async (capture: string, seconds: number, name: string): Promise<string> => {
  const capturePath = join(CAPTURES_DIRECTORY, capture);
  if (!existsSync(capturePath)) throw new InvalidOperationError(Operation.Read, capturePath, "is not in captures");
  const directory = join(REFERENCES_DIRECTORY, name);
  await mkdir(directory, { recursive: true });
  const framePath = join(directory, `${seconds}s.png`);
  await writeCaptureFrame(capturePath, seconds, framePath, []);
  const url = getCaptureUrl(capture);
  const source = url === undefined ? `Recording: ${capture}` : `Video: ${url}`;
  await writeFile(join(directory, "SOURCE.txt"), `${source}\nFrame at ${seconds} seconds into ${capture}\n`);
  return framePath;
};
