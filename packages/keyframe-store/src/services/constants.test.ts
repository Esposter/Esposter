import type { VersionAnchor } from "#src/models/VersionAnchor";

import { describe } from "vitest";

// The anchor a session's first write carries, before any keyframe exists to anchor on
export const EMPTY_ANCHOR: VersionAnchor = { anchoredBytes: 0, hash: "" };

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("constants");
