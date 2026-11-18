import type { EmitterValue } from "#src/models/genshinAssets/particles/EmitterValue";

// One field as text: its numbers, or the reason it is not held
export const formatEmitterValue = <T>(value: EmitterValue<T>, format: (read: T) => string): string =>
  value.kind === "read" ? format(value.value) : `not held: ${value.reason}`;
