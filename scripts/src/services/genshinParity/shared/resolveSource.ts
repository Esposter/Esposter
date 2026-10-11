import { resolveWikiFiles } from "#src/services/genshinParity/shared/resolveWikiFiles";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A local file as it is, or a wiki title (`File:…`) fetched once into the references and kept as the wiki serves it,
// So a GIF or a video keeps its frames
export const resolveSource = async (source: string): Promise<string> => {
  if (!source.startsWith("File:")) return source;
  const path = (await resolveWikiFiles([source])).get(source);
  if (!path) throw new InvalidOperationError(Operation.Read, source, "not on the wiki");
  return path;
};
