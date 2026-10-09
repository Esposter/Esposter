import { CHARACTER_TERMS_FILE_NAMES } from "#src/services/genshinCharacters/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { basename, extname } from "node:path";

// The terms bundled with a pack: the text file whose name holds the earliest of CHARACTER_TERMS_FILE_NAMES, then the
// One nearest the folder's root. A folder with none is refused, since a model is published only beside its terms
export const chooseCharacterTermsFile = (folder: string, filePaths: readonly string[]): string => {
  const [termsFile] = filePaths
    .flatMap((filePath) => {
      if (extname(filePath).toLowerCase() !== ".txt") return [];
      const name = basename(filePath).normalize("NFC").toLowerCase();
      const nameIndex = CHARACTER_TERMS_FILE_NAMES.findIndex((termsFileName) => name.includes(termsFileName));
      return nameIndex === -1 ? [] : [{ depth: filePath.split("/").length, filePath, nameIndex }];
    })
    .toSorted((a, b) => a.nameIndex - b.nameIndex || a.depth - b.depth || (a.filePath < b.filePath ? -1 : 1));
  if (termsFile === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      folder,
      `holds no terms file, a .txt named ${CHARACTER_TERMS_FILE_NAMES.join(", ")}`,
    );
  return termsFile.filePath;
};
