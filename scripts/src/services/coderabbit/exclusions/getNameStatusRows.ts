import type { NameStatusRow } from "#src/models/coderabbit/exclusions/NameStatusRow";

// A status letter with an optional score, the path, and a second path on a rename
const ROW_REGEX = /^(?<status>[A-Z]\d*)\t(?<oldPath>[^\t]+)(?:\t(?<newPath>[^\t]+))?$/u;

// The one reading of the listing, so every classifier asks it for the path a row ends at and the one it came from
// Rather than re-parsing the rows for the field it wants
export const getNameStatusRows = (nameStatus: string): NameStatusRow[] =>
  nameStatus.split("\n").flatMap((line) => {
    const groups = ROW_REGEX.exec(line)?.groups;
    if (groups?.status === undefined || groups.oldPath === undefined) return [];
    const row: NameStatusRow =
      groups.newPath === undefined
        ? { path: groups.oldPath, status: groups.status }
        : { path: groups.newPath, renamedFrom: groups.oldPath, status: groups.status };
    return [row];
  });
