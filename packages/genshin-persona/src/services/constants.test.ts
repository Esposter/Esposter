import type { HookEntry } from "#src/models/HookEntry";
import type { StatusLine } from "#src/models/StatusLine";

import { describe } from "vitest";

// A status line and a hook entry a person wrote, which setup and voice leave alone and teardown keeps
export const FOREIGN_STATUS_LINE: StatusLine = { command: "command", type: "command" };
export const FOREIGN_HOOK_ENTRY: HookEntry = { hooks: [{ command: "command", type: "command" }] };

// The epoch as a plain date, computed rather than typed, so every suite spells it the one way. A birthday is
// Compared inside one leap year wherever it is read, so the epoch's own year never reaches an assertion
export const TEST_EPOCH_DATE: Temporal.PlainDate = Temporal.Instant.fromEpochMilliseconds(0)
  .toZonedDateTimeISO("UTC")
  .toPlainDate();

describe.todo("constants");
