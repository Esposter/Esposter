import type { ParityReferenceBase } from "#src/models/genshinParity/shared/ParityReferenceBase";

import { CAPTURES_DIRECTORY, REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { writeCaptureFrame } from "#src/services/genshinParity/shared/writeCaptureFrame";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The image a backdrop's plate is filled from: the reference itself, or with a `plateCapture` one frame of its recording,
// Written beside the references, so the world a screen is laid over is the frame as the recording shows it
export const getPlateSourcePath = async (
  referenceId: string,
  referencePath: string,
  plateCapture: ParityReferenceBase["plateCapture"],
): Promise<string> => {
  if (!plateCapture) return referencePath;
  const capturePath = join(CAPTURES_DIRECTORY, plateCapture.capture);
  if (!existsSync(capturePath))
    throw new InvalidOperationError(Operation.Read, plateCapture.capture, `no recording at ${capturePath}`);
  const framePath = join(REFERENCES_DIRECTORY, `${referenceId}.frame.png`);
  await writeCaptureFrame(capturePath, plateCapture.seconds, framePath, []);
  return framePath;
};
