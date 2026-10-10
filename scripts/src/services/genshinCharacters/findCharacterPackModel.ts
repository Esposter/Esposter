import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { extname } from "node:path";

// The one model a pack's folder holds, by its path in the folder. A folder with none or with several is refused, naming
// Each, since which model the world draws is not the publisher's to guess
export const findCharacterPackModel = (folder: string, filePaths: readonly string[]): string => {
  const modelPaths = filePaths.filter((filePath) => extname(filePath).toLowerCase() === ".pmx");
  if (modelPaths.length === 0) throw new InvalidOperationError(Operation.Read, folder, "holds no .pmx model");
  if (modelPaths.length > 1)
    throw new InvalidOperationError(Operation.Read, folder, `holds several .pmx models: ${modelPaths.join(", ")}`);
  return takeOne(modelPaths);
};
