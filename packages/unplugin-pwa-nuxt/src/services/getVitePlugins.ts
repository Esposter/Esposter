import type { Plugin } from "vite";

import { BuildPwaAssetsPlugin } from "@unplugin-pwa/vite/plugins/build-pwa-assets";
import { DevPlugin } from "@unplugin-pwa/vite/plugins/dev";
import { DevMiddlewarePlugin } from "@unplugin-pwa/vite/plugins/dev-middleware";
import { InfoPlugin } from "@unplugin-pwa/vite/plugins/info";
import { MainPlugin } from "@unplugin-pwa/vite/plugins/main";
import { VirtualModulesPlugin } from "@unplugin-pwa/vite/plugins/virtual-modules";

type PwaContext = Parameters<typeof MainPlugin>[0];

// The engine's plugins less the three this module owns and the two that serve the icon generator the module does not
// Carry: the worker is built when Nitro has the app's files, not when the client bundle closes, nothing injects a
// Register script because the client plugin registers the worker, and the devtools are a Vite-devtools panel. The build
// Plugin stays, since it writes the manifest the app links
export const getVitePlugins = (context: PwaContext): Plugin[] => [
  MainPlugin(context),
  VirtualModulesPlugin(context),
  InfoPlugin(context),
  DevPlugin(context),
  DevMiddlewarePlugin(context),
  BuildPwaAssetsPlugin(context),
];
