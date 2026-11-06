// What a harness step, or a driver's save and load, reports: done, or the error it refuses with
export type ScriptedSessionOutcome = { error: string; ok: false } | { ok: true };
