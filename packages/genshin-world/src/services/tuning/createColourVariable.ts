import type { DevVariable } from "#src/models/dev/DevVariable";
import type { Color } from "three";

import { DevVariableKind } from "#src/models/dev/DevVariableKind";

// A colour an owner holds, read and written as the hexadecimal a colour is written in the game's own tables
export const createColourVariable = (
  owner: { value: Color },
  { group, name }: { group: string; name: string },
): DevVariable => ({
  get: () => `#${owner.value.getHexString()}`,
  group,
  kind: DevVariableKind.Colour,
  name,
  set: (value) => {
    owner.value.set(String(value));
  },
});
