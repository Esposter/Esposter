import type { Provenance } from "#src/models/provenance/Provenance";

import { describe } from "vitest";

// A stamp as a writer leaves it, naming the game version and the command it was written by
export const createStamp = (command: string, gameVersion: string): Provenance => ({
  command,
  gameVersion,
  operatingSystem: { platform: "a", release: "b", version: "c" },
  producer: { commit: "d", isDirty: false, producerPaths: [] },
  sources: [],
  tools: [],
});

describe.todo("createStamp");
