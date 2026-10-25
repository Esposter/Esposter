import { STORE_DIRECTORY } from "#src/services/sweeps/staleNames/constants";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// The packages pnpm's store holds, each a real directory under `<name@version>/node_modules/` beside symlinks to
// Its own dependencies — the symlinks are skipped, since each points at another entry the walk reaches itself.
// The store's own `node_modules` is the hoisted symlink tree, not a package
export const readStorePackageDirectories = (): string[] =>
  readdirSync(STORE_DIRECTORY, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "node_modules")
    .map((entry) => join(STORE_DIRECTORY, entry.name, "node_modules"))
    .flatMap((modulesDirectory) =>
      readdirSync(modulesDirectory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((entry) =>
          entry.name.startsWith("@")
            ? readdirSync(join(modulesDirectory, entry.name), { withFileTypes: true })
                .filter((scopedEntry) => scopedEntry.isDirectory())
                .map((scopedEntry) => join(modulesDirectory, entry.name, scopedEntry.name))
            : [join(modulesDirectory, entry.name)],
        ),
    );
