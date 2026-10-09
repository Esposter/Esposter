import { getCharacterNameKey } from "#src/services/character/getCharacterNameKey";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The model a pack's folder draws its character with, by its path in the folder: its one .pmx, or, of several, the one
// Whose own name is one of the character's names. The names are read only for a folder of several, and a folder with
// None, or with several and not one named as its character, is refused naming each, since which model is drawn is not
// A reader's to guess
export const chooseCharacterPackModel = async (
  folder: string,
  filePaths: readonly string[],
  readModelName: (filePath: string) => Promise<string>,
  readCharacterNames: () => Promise<readonly string[]>,
): Promise<string> => {
  const modelPaths = filePaths.filter((filePath) => filePath.toLowerCase().endsWith(".pmx"));
  if (modelPaths.length === 0) throw new InvalidOperationError(Operation.Read, folder, "holds no .pmx model");
  if (modelPaths.length === 1) return takeOne(modelPaths);
  const [characterNames, modelNames] = await Promise.all([
    readCharacterNames(),
    Promise.all(modelPaths.map((modelPath) => readModelName(modelPath))),
  ]);
  const characterNameKeys = new Set(characterNames.map((characterName) => getCharacterNameKey(characterName)));
  const namedModelPaths = modelPaths.filter((_modelPath, index) =>
    characterNameKeys.has(getCharacterNameKey(takeOne(modelNames, index))),
  );
  if (namedModelPaths.length !== 1)
    throw new InvalidOperationError(
      Operation.Read,
      folder,
      `holds several .pmx models, ${namedModelPaths.length} named as its character: ${modelPaths.join(", ")}`,
    );
  return takeOne(namedModelPaths);
};
