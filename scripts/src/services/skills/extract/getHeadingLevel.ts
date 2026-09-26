const HEADING_REGEX = /^(?<hashes>#+) /u;
// A markdown line's heading level, 0 for a line that is not a heading
export const getHeadingLevel = (line: string): number => HEADING_REGEX.exec(line)?.groups?.hashes?.length ?? 0;
