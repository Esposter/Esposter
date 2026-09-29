import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/constants";
import { readWikiFile } from "genshin-persona/src/services/readWikiFile.ts";
import { readWikiFileUrls } from "genshin-persona/src/services/readWikiFileUrls.ts";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// A local file as it is, or a wiki title (`File:…`) fetched once into the references and kept as the wiki serves it,
// So a GIF or a video keeps its frames
export const resolveSource = async (source: string): Promise<string> => {
  if (!source.startsWith("File:")) return source;
  const path = join(REFERENCES_DIRECTORY, source.slice("File:".length).replaceAll(" ", "_"));
  if (existsSync(path)) return path;
  const urls = await readWikiFileUrls([source]);
  const url = urls.get(source);
  const file = url ? await readWikiFile(url) : undefined;
  if (!file) throw new InvalidOperationError(Operation.Read, source, "not on the wiki");
  await mkdir(REFERENCES_DIRECTORY, { recursive: true });
  await writeFile(path, file);
  return path;
};
