import type { DevValue } from "#src/models/dev/DevValue";
import type { GenshinSave } from "#src/models/save/GenshinSave";

// What a command over the save answers: the save it writes and the value it reports, or the error it refuses with
export type DevSaveOutcome = { ok: true; save: GenshinSave; value: DevValue } | { error: string; ok: false };
