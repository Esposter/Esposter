import { CHARACTER_TERMS_FILE_NAMES } from "#src/services/character/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The terms bundled with a pack, by its path in the pack's folder, `filePaths` relative to it and separated by slashes:
// The text file whose name holds the earliest of CHARACTER_TERMS_FILE_NAMES, then the one nearest the folder's root. A
// Folder with none is refused, since a model is drawn only beside its terms
export const chooseCharacterTermsFile = (folder: string, filePaths: readonly string[]): string => {
  const [termsFile] = filePaths
    .flatMap((filePath) => {
      const parts = filePath.split("/");
      const name = (parts.at(-1) ?? "").normalize("NFC").toLowerCase();
      if (!name.endsWith(".txt")) return [];
      const nameIndex = CHARACTER_TERMS_FILE_NAMES.findIndex((termsFileName) => name.includes(termsFileName));
      return nameIndex === -1 ? [] : [{ depth: parts.length, filePath, nameIndex }];
    })
    .toSorted(
      (firstTermsFile, secondTermsFile) =>
        firstTermsFile.nameIndex - secondTermsFile.nameIndex ||
        firstTermsFile.depth - secondTermsFile.depth ||
        (firstTermsFile.filePath < secondTermsFile.filePath ? -1 : 1),
    );
  if (termsFile === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      folder,
      `holds no terms file, a .txt named ${CHARACTER_TERMS_FILE_NAMES.join(", ")}`,
    );
  return termsFile.filePath;
};
