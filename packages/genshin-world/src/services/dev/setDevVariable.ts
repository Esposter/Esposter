import type { DevOutcome } from "#src/models/dev/DevOutcome";
import type { DevVariable } from "#src/models/dev/DevVariable";

import { DevVariableKind } from "#src/models/dev/DevVariableKind";
import { HEX_COLOUR_REGEX } from "#src/services/dev/constants";
import { exhaustiveGuard } from "@esposter/shared";

// Reads a console's text as the variable's kind, refuses a value outside it and leaves the variable as it was, and writes
// An accepted value through the variable's own set, so the owner's state is the only copy
export const setDevVariable = (variable: DevVariable, text: string): DevOutcome => {
  switch (variable.kind) {
    case DevVariableKind.Boolean: {
      if (text !== "true" && text !== "false") return { error: "expected true or false", ok: false };

      const value = text === "true";
      variable.set(value);
      return { ok: true, value };
    }
    case DevVariableKind.Choice: {
      const choices = variable.choices ?? [];
      if (!choices.includes(text)) return { error: `expected one of ${choices.join(", ")}`, ok: false };

      variable.set(text);
      return { ok: true, value: text };
    }
    case DevVariableKind.Colour: {
      if (!HEX_COLOUR_REGEX.test(text)) return { error: "expected a colour such as #1a2b3c", ok: false };

      variable.set(text);
      return { ok: true, value: text };
    }
    case DevVariableKind.Number: {
      const value = Number(text);
      if (!Number.isFinite(value)) return { error: "expected a number", ok: false };

      const { range } = variable;
      if (range && (value < range.min || value > range.max))
        return { error: `${variable.name} must be from ${range.min} to ${range.max}`, ok: false };

      variable.set(value);
      return { ok: true, value };
    }
    default:
      return exhaustiveGuard(variable.kind);
  }
};
