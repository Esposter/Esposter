import { NUMBER_SOURCE } from "#src/services/genshinParity/shared/constants";
import { formatGeneratedSource } from "#src/services/shared/formatGeneratedSource";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile, writeFile } from "node:fs/promises";

const NUMBER_REGEX = new RegExp(NUMBER_SOURCE, "gu");
const ENTRY_REGEX = /\[(?<key>[^\]]+)\]:\s*"(?<path>[^"]*)"/gu;
const PATH_DECIMALS = 2;

// A traced path, whose numbers are in the enlarged pixels its trace was made at, divided by that scale into the
// Reference's own pixels, each to a hundredth of one
export const toReferencePath = (path: string, scale: number): string =>
  path.replaceAll(NUMBER_REGEX, (value) => String(Number((Number(value) / scale).toFixed(PATH_DECIMALS))));

// Writes a traced path into the keyed record its map source declares, as the entry under `key`, divided by its scale into
// The reference's pixels (`toReferencePath`). The key is written as the source's own text, such as `InterfaceIcon.Exit`.
// The record's entries are read in whatever layout the formatter last gave it and written back in order through it, since
// A short record is laid out on one line. An entry the record holds under the key is replaced where it stands, and a new
// One is added last
export const writeTracedPath = async (mapPath: string, key: string, path: string, scale: number): Promise<void> => {
  const source = await readFile(mapPath, "utf8");
  const open = source.search(/[=] \{/u);
  const close = open < 0 ? -1 : source.indexOf("}", open);
  if (open < 0 || close < 0) throw new InvalidOperationError(Operation.Read, mapPath, "declares no keyed record");
  // The body is rebuilt from its entries, so anything else in the braces, such as a comment, would be dropped
  const residue = source.slice(open + "= {".length, close).replaceAll(ENTRY_REGEX, "");
  if (residue.replaceAll(/[\s,]/gu, "") !== "")
    throw new InvalidOperationError(
      Operation.Update,
      mapPath,
      "holds content other than keyed entries, which a write drops",
    );
  const entries = new Map<string, string>([
    ...Array.from(source.slice(open, close).matchAll(ENTRY_REGEX), ({ groups }): [string, string] => [
      groups?.key ?? "",
      groups?.path ?? "",
    ]),
    [key, toReferencePath(path, scale)],
  ]);
  const body = Array.from(entries, ([entryKey, entryPath]) => `  [${entryKey}]: "${entryPath}",`);
  const written = `${source.slice(0, open + "= {".length)}\n${body.join("\n")}\n${source.slice(close)}`;
  await writeFile(mapPath, await formatGeneratedSource(mapPath, written));
};
