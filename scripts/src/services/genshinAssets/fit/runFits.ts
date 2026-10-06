import { InvalidOperationError, Operation } from "@esposter/shared";

// A component's fits by name, each writing its data files and returning its report and their paths: every fit, or
// Only those named, so one fit's change is read without every other file rewritten. A name no fit has is an error
export const runFits = async (
  fits: Record<string, () => Promise<string[]>>,
  only: readonly string[],
): Promise<string> => {
  const unknown = only.find((name) => !(name in fits));
  if (unknown !== undefined)
    throw new InvalidOperationError(Operation.Read, unknown, `not a fit: one of ${Object.keys(fits).join(", ")}`);
  const lines = await Promise.all(
    Object.entries(fits)
      .filter(([name]) => only.length === 0 || only.includes(name))
      .map(([, fit]) => fit()),
  );
  return lines.flat().join("\n");
};
