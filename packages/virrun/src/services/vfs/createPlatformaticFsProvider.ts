import type { FsProvider } from "#src/models/vfs/FsProvider";

import { create } from "@platformatic/vfs";
// The swap shim: the ONLY module that imports @platformatic/vfs, to be replaced by core node:vfs when it
// Ships without a flag. moduleHooks is always on — patching require/import + core fs is the point.
// See apps/web/content/docs/virrun/execution-backends.md.
export const createPlatformaticFsProvider = (): FsProvider => {
  const vfs = create({ moduleHooks: true });
  return {
    dispose: () => {
      if (vfs.mounted) vfs.unmount();
    },
    exists: (path) => vfs.existsSync(path),
    mkdir: (path) => {
      vfs.mkdirSync(path, { recursive: true });
    },
    mount: () => vfs.mount(),
    name: "platformatic",
    readFile: (path) => vfs.readFileSync(path, "utf8"),
    unmount: () => {
      vfs.unmount();
    },
    writeFile: (path, data) => {
      vfs.writeFileSync(path, data);
    },
  };
};
