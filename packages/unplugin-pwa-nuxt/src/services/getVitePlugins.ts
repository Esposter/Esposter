import type { Plugin } from "vite";

import { createWorkboxWindowPlugin } from "#src/services/createWorkboxWindowPlugin";
import { BuildPwaAssetsPlugin } from "@unplugin-pwa/vite/plugins/build-pwa-assets";
import { DevPlugin } from "@unplugin-pwa/vite/plugins/dev";
import { DevMiddlewarePlugin } from "@unplugin-pwa/vite/plugins/dev-middleware";
import { DevAssetsMiddlewarePlugin } from "@unplugin-pwa/vite/plugins/dev-pwa-assets-middleware";
import { InfoPlugin } from "@unplugin-pwa/vite/plugins/info";
import { MainPlugin } from "@unplugin-pwa/vite/plugins/main";
import { AssetsPlugin } from "@unplugin-pwa/vite/plugins/pwa-assets";
import { VirtualModulesPlugin } from "@unplugin-pwa/vite/plugins/virtual-modules";

type PwaContext = Parameters<typeof MainPlugin>[0];

// The engine's plugins less the three this module owns: the worker is built when Nitro has the app's files, not when
// The client bundle closes, nothing injects a register script because the client plugin registers the worker, and the
// Devtools are a Vite-devtools panel
export const getVitePlugins = (context: PwaContext): Plugin[] => [
  MainPlugin(context),
  VirtualModulesPlugin(context),
  InfoPlugin(context),
  DevPlugin(context),
  DevMiddlewarePlugin(context),
  DevAssetsMiddlewarePlugin(context),
  AssetsPlugin(context),
  BuildPwaAssetsPlugin(context),
  createWorkboxWindowPlugin(),
];
