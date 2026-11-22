import { InvalidOperationError, Operation } from "@esposter/shared";
import { statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

// The source file a re-export names: a relative one beside its barrel, or one under the package's `#src/` alias. A name
// Is written with its extension, its bare name or its folder's index, as a barrel writes it
export const resolveReExportSource = (fromPath: string, specifier: string, sourceDirectory: string): string => {
  const base = specifier.startsWith("#src/")
    ? join(sourceDirectory, specifier.slice("#src/".length))
    : resolve(dirname(fromPath), specifier);
  const source = [base, `${base}.ts`, join(base, "index.ts")].find(
    (path) => statSync(path, { throwIfNoEntry: false })?.isFile() === true,
  );
  if (source === undefined)
    throw new InvalidOperationError(Operation.Read, specifier, "does not resolve to a source file beside its barrel");
  return source;
};
