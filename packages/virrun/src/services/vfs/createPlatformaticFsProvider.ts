import type { FsProvider } from "@/models/vfs/FsProvider";
import type { FsProviderOptions } from "@/models/vfs/FsProviderOptions";

import { create } from "@platformatic/vfs";
// The swap shim: the ONLY module that imports @platformatic/vfs. node:vfs is the same work landing
// In core (nodejs/node#61478); when it ships, this one file changes and nothing else does. moduleHooks
// Is always on — patching require/import + core fs to serve virtual files is the whole point of the
// FS layer. See features/virrun/specs/virtual-fs.md.
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
