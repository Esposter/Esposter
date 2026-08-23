import type { FsProvider } from "#src/models/vfs/FsProvider";
import type { FsProviderOptions } from "#src/models/vfs/FsProviderOptions";

import { create } from "@platformatic/vfs";
// The swap shim: the ONLY module that imports @platformatic/vfs, to be replaced by core node:vfs when it
// Ships (nodejs/node#61478). moduleHooks is always on — patching require/import + core fs is the point.
// See packages/app/content/docs/virrun/execution-backends.md.
export const createPlatformaticFsProvider = ({
  isOverlayEnabled = false,
}: Partial<FsProviderOptions> = {}): FsProvider => {
  const vfs = create({ moduleHooks: true, overlay: isOverlayEnabled });
  return {
    dispose: () => {
      if (vfs.mounted) vfs.unmount();
    },
    exists: (path) => vfs.existsSync(path),
    mkdir: (path) => {
      vfs.mkdirSync(path, { recursive: true });
    },
    mount: (prefix) => {
      vfs.mount(prefix);
    },
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
