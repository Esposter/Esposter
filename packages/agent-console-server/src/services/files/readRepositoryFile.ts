import { REPOSITORY_FILE_MAX_BYTE_LENGTH } from "#src/services/files/constants";
import { resolveRepositoryPath } from "#src/services/files/resolveRepositoryPath";
import { readFile, stat } from "node:fs/promises";

export interface RepositoryFile {
  content: string;
  // Empty when the file's text is in content, else why the view cannot show it
  notice: string;
}

// A file the session names, as text. One too large to show, or one holding a NUL byte, answers with its reason only
export const readRepositoryFile = async (cwd: string, path: string): Promise<RepositoryFile> => {
  const target = await resolveRepositoryPath(cwd, path);
  const { size } = await stat(target);
  if (size > REPOSITORY_FILE_MAX_BYTE_LENGTH) return { content: "", notice: "The file is too large to show." };

  const buffer = await readFile(target);
  if (buffer.includes(0)) return { content: "", notice: "The file is not text, so it cannot be shown." };
  return { content: buffer.toString("utf8"), notice: "" };
};
