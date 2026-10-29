import type { DevVariable } from "#src/models/dev/DevVariable";

import { DevVariableKind } from "#src/models/dev/DevVariableKind";

// A number an owner holds under a key, exposed as a variable that reads and writes that key, so the owner's own state is
// The only copy. A write runs `onChange` after it lands, for the texture an owner draws from the number
export const createNumberVariable = <TKey extends string>(
  owner: Record<TKey, number>,
  key: TKey,
  {
    group,
    name,
    onChange,
    range,
  }: { group: string; name: string; onChange?: () => void; range: NonNullable<DevVariable["range"]> },
): DevVariable => ({
  get: () => owner[key],
  group,
  kind: DevVariableKind.Number,
  name,
  range,
  set: (value) => {
    owner[key] = Number(value);
    onChange?.();
  },
});
