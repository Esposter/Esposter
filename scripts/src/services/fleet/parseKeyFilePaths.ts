// A proposal's Key files table: each row opens on a backticked path. The table is read where its `## Key files` heading
// Opens, as `getProposalSummary` reads it, so a row elsewhere on the page is never a file the proposal touches
const SECTION_SPLIT_REGEX = /^## /mu;
const KEY_FILES_HEADING_REGEX = /^Key files\s*$/iu;
const KEY_FILE_ROW_REGEX = /^\| `(?<path>[^`]+)`/gmu;

export const parseKeyFilePaths = (text: string): string[] => {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/u, "");
  const keyFilesSection = body
    .split(SECTION_SPLIT_REGEX)
    .find((section) => KEY_FILES_HEADING_REGEX.test(section.split("\n")[0] ?? ""));
  return Array.from(keyFilesSection?.matchAll(KEY_FILE_ROW_REGEX) ?? [], ({ groups }) => groups?.path ?? "");
};
