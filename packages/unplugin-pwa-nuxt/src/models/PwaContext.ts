import type { VitePWAStrategy } from "@unplugin-pwa/core";
import type { VitePWAPluginContext } from "@unplugin-pwa/vite/vite-context";
import type { SWType } from "@vite-pwa/workbox-build/types";

export type PwaContext = VitePWAPluginContext<"vite", VitePWAStrategy, SWType>;
