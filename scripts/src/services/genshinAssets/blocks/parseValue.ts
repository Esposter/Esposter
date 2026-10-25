import { parseMachineJson } from "#src/services/shared/parseMachineJson";

// Reads a JSON string's value off one line of the asset map, which AnimeStudio writes one field a line
export const parseValue = (line: string, prefix: string): string =>
  parseMachineJson(`"${line.slice(prefix.length, line.lastIndexOf('"'))}"`);
