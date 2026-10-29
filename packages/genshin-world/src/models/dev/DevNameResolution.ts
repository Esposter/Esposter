// The entry a name looks up, or the error a name that no single entry holds is refused with
export type DevNameResolution<TEntry> = { entry: TEntry; ok: true } | { error: string; ok: false };
