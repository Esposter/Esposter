import type { TimingArgs } from "#src/models/timing/TimingArgs";

// A flag is a dash or two dashes and a name opening with a letter, so the `--` separator and a negative number are
// Positionals, and a flag's `=value` never reaches the name
const FLAG_REGEX = /^-{1,2}(?<name>[a-z][\w-]*)/iu;

export const getTimingArgs = (rawArgs: string[]): TimingArgs => {
  const flags = new Set<string>();
  let positionals = 0;
  for (const argument of rawArgs) {
    const flagName = FLAG_REGEX.exec(argument)?.groups?.name;
    if (flagName === undefined) positionals++;
    else flags.add(flagName);
  }

  return { flags: [...flags].toSorted(), positionals };
};
