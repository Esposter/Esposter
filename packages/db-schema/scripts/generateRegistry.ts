import { execSync } from "node:child_process";
import { glob, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface RegistryEntry {
  exportNames: string[];
  specifier: string;
}

// Writes the two registries drizzle reads — every table, enum and Postgres schema, and every relation part — from
// The folders that declare them, so a declaration is registered by existing and no list is kept by hand
const sourceDirectory = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const generatedDirectory = join(sourceDirectory, "generated");

const readEntries = async (pattern: string, declarationRegex: RegExp): Promise<RegistryEntry[]> => {
  const entries: RegistryEntry[] = [];
  for await (const fileName of glob(pattern, { cwd: sourceDirectory })) {
    const text = await readFile(join(sourceDirectory, fileName), "utf8");
    const exportNames = Array.from(text.matchAll(declarationRegex), ([, exportName]) => exportName ?? "").toSorted(
      (firstExportName, secondExportName) => firstExportName.localeCompare(secondExportName),
    );
    if (exportNames.length > 0)
      entries.push({ exportNames, specifier: `#src/${fileName.replaceAll("\\", "/").replace(/\.ts$/u, "")}` });
  }
  return entries.toSorted((firstEntry, secondEntry) => firstEntry.specifier.localeCompare(secondEntry.specifier));
};

const getImports = (entries: RegistryEntry[]) =>
  entries.map(({ exportNames, specifier }) => `import { ${exportNames.join(", ")} } from "${specifier}";`).join("\n");

const getNames = (entries: RegistryEntry[]) =>
  entries
    .flatMap(({ exportNames }) => exportNames)
    .toSorted((firstName, secondName) => firstName.localeCompare(secondName));

const schemaEntries = await readEntries(
  "schema/**/*.ts",
  /^export const (\w+) = (?:pgTable\(|\w+Schema\.enum\(|camelCase\.schema\()/gmu,
);
const relationEntries = await readEntries("relations/**/*.ts", /^export const (\w+) = defineRelationsPart\(/gmu);
const schemaPath = join(generatedDirectory, "schema.ts");
const relationsPath = join(generatedDirectory, "relations.ts");

await rm(generatedDirectory, { force: true, recursive: true });
await mkdir(generatedDirectory, { recursive: true });
await writeFile(
  schemaPath,
  `${getImports(schemaEntries)}\n\nexport const schema = {\n${getNames(schemaEntries)
    .map((name) => `  ${name},`)
    .join("\n")}\n};\n`,
);
await writeFile(
  relationsPath,
  `${getImports(relationEntries)}\n\nexport const relations = {\n${getNames(relationEntries)
    .map((name) => `  ...${name},`)
    .join("\n")}\n};\n`,
);
// Emitted in the formatter's own shape, so `pnpm format` never rewrites a generated file
execSync(`oxfmt "${schemaPath}" "${relationsPath}"`, { stdio: "inherit" });
