import type { ClientBundleReport } from "#src/models/dependencies/score/ClientBundleReport";

import { APP_DIRECTORY, APP_PUBLIC_DIRECTORY, EXPLORER_MODULE } from "#src/services/dependencies/score/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { gzipSync } from "node:zlib";

// A static or dynamic import of a sibling chunk, the three spellings the bundler writes one in
const IMPORT_PATTERN = /(?:from\s*"\.\/([^"]+\.js)"|import\(\s*"\.\/([^"]+\.js)"\s*\)|import\s*"\.\/([^"]+\.js)")/g;

const getModuleBundleNames = (report: ClientBundleReport, moduleId: string): Set<string> =>
  new Set(
    Object.values(report.nodeMetas)
      .filter(({ id }) => id.includes(moduleId))
      .flatMap(({ moduleParts }) => Object.keys(moduleParts)),
  );

// Every chunk file a bundle reaches through its imports, each as the absolute path it is read from
const getChunkClosure = (bundlePaths: Iterable<string>): Set<string> => {
  const reached = new Set<string>();
  const pending = [...bundlePaths];
  for (let path = pending.pop(); path !== undefined; path = pending.pop()) {
    if (reached.has(path)) continue;
    reached.add(path);
    for (const match of readFileSync(path, "utf8").matchAll(IMPORT_PATTERN)) {
      const specifier = match.slice(1).find((group) => group !== undefined);
      if (specifier !== undefined) pending.push(resolve(dirname(path), specifier));
    }
  }
  return reached;
};

// The gzipped bytes of the chunks an editor's script loads beyond the chunks the explorer's script loads, read from the
// Production build the client bundle report was written beside. A missing report or build throws rather than reads as zero
export const getEditorScriptBytes = (report: ClientBundleReport, editorModule: string): number => {
  const publicDirectory = resolve(REPOSITORY_ROOT, APP_DIRECTORY, APP_PUBLIC_DIRECTORY);
  const explorerBundles = getModuleBundleNames(report, EXPLORER_MODULE);
  const editorBundles = getModuleBundleNames(report, editorModule);
  if (explorerBundles.size === 0)
    throw new InvalidOperationError(Operation.Read, EXPLORER_MODULE, "not in the client bundle report");
  if (editorBundles.size === 0)
    throw new InvalidOperationError(Operation.Read, editorModule, "not in the client bundle report");

  const explorerChunks = getChunkClosure([...explorerBundles].map((bundle) => resolve(publicDirectory, bundle)));
  const editorChunks = getChunkClosure([...editorBundles].map((bundle) => resolve(publicDirectory, bundle)));
  let bytes = 0;
  for (const chunk of editorChunks)
    if (!explorerChunks.has(chunk)) bytes += gzipSync(readFileSync(chunk), { level: 9 }).length;
  return bytes;
};
