import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Each object's migrations barrel is written by `drizzle-kit generate` with relative `./<name>/migration.sql` imports.
// This package's `#src` map cannot resolve those, so this rewrites them to the map's specifiers.
// Each barrel is then the object's own source, which `db:gen` formats from the repository root, where the formatter's configuration is found.
const OBJECTS = ["call", "room", "user"];

await Promise.all(
  OBJECTS.map(async (object) => {
    const barrelPath = join(import.meta.dirname, "..", "src", "objects", object, "migrations", "migrations.js");
    const source = await readFile(barrelPath, "utf8");
    await writeFile(
      barrelPath,
      source.replaceAll(
        /from '\.\/(?<migrationName>[^']+)\/migration\.sql';/gu,
        (_match, migrationName: string) => `from "#src/objects/${object}/migrations/${migrationName}/migration.sql";`,
      ),
    );
  }),
);
