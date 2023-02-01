import { CodeExtension, fileTypes } from "@/models/file";

export const getFileTypeForPath = (path: string): keyof typeof CodeExtension => {
  const filename = path.split(/[/\\]/).pop();
  if (!filename) return "Text";

  for (const fileType of fileTypes) if (filename.match(fileType.filenameSupportPattern)) return fileType.type;

  return "Text";
};
