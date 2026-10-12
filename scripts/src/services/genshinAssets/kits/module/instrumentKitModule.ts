import type { KitModuleAnalysis } from "#src/models/genshinAssets/kits/module/KitModuleAnalysis";

import { KIT_PROBE_ENTRIES_NAME } from "#src/services/genshinAssets/kits/constants";
import { readFileSync } from "node:fs";
import ts from "typescript";

// A kit module's text as JavaScript with its sites probed: each span the analysis names wrapped so that, each time it is
// Evaluated, it first adds a thunk for each of its sites to a list the module exports, which reads the site's value
// Again where the span starts. Spans are wrapped from the last back, so each insertion leaves the earlier offsets whole,
// And of two at one offset the outer opens first and closes last
export const instrumentKitModule = ({ file, registrations, sites }: KitModuleAnalysis): string => {
  const expressionTextMap = new Map(sites.map(({ expressionText, id }) => [id, expressionText]));
  const insertions = registrations.flatMap(({ end, siteIds, start }, order) => {
    const thunks = siteIds.map((id) => `[${JSON.stringify(id)}, () => (${expressionTextMap.get(id)})]`).join(", ");
    return [
      { offset: start, order: -order, text: `(${KIT_PROBE_ENTRIES_NAME}.push(${thunks}), ` },
      { offset: end, order, text: ")" },
    ];
  });
  let text = readFileSync(file, "utf8");
  for (const { offset, text: insertion } of insertions.toSorted(
    (firstInsertion, secondInsertion) =>
      secondInsertion.offset - firstInsertion.offset || secondInsertion.order - firstInsertion.order,
  ))
    text = `${text.slice(0, offset)}${insertion}${text.slice(offset)}`;
  return ts.transpileModule(`export const ${KIT_PROBE_ENTRIES_NAME} = [];\n${text}`, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2024 },
    fileName: file,
  }).outputText;
};
