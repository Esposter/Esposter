import type { DevValue } from "#src/models/dev/DevValue";
import type { DevVariableKind } from "#src/models/dev/DevVariableKind";

// A tunable value an owner exposes by name: the registry reads it through `get` and writes the value a console line
// Or a control gives, and the owner's own state is the only copy, so a reload starts from the game's value
export interface DevVariable {
  choices?: readonly string[];
  get: () => DevValue;
  group: string;
  kind: DevVariableKind;
  name: string;
  range?: { max: number; min: number };
  set: (value: DevValue) => void;
}
