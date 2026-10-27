import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { describe } from "vitest";

// A writer that keeps each value it is given at its path, its file and line, and records no other rule
export const createRecordingGcsimKitCandidateWriter = (
  added: Map<string, { file: string; line: number; value: unknown }>,
): GcsimKitCandidateWriter => ({
  add: (path, value, file, line) => {
    added.set(path, { file, line, value });
  },
  addFrames: () => undefined,
  addHit: () => undefined,
  addNoActionFileRule: () => undefined,
  toFile: (name) => name,
});

describe.todo("createRecordingGcsimKitCandidateWriter");
