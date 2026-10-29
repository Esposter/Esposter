import type { DevVariable } from "#src/models/dev/DevVariable";

import { DevVariableKind } from "#src/models/dev/DevVariableKind";

// A switch an owner holds as a boolean, exposed as a variable that reads it and writes what a console line or a control gives,
// So the owner's own state is the only copy
export const createBooleanVariable = ({
  get,
  group,
  name,
  set,
}: {
  get: () => boolean;
  group: string;
  name: string;
  set: (value: boolean) => void;
}): DevVariable => ({
  get,
  group,
  kind: DevVariableKind.Boolean,
  name,
  set: (value) => {
    set(value === true);
  },
});
