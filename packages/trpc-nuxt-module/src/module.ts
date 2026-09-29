// Nuxt's `nitro` option is declared by its Nitro builder's augmentation, which a module outside a Nuxt app does not load
/// <reference types="@nuxt/nitro-server" />
import type { ModuleOptions } from "#src/models/ModuleOptions";
import type { NuxtModule } from "@nuxt/schema";

import { DEFAULT_ENDPOINT, MODULE_NAME } from "#src/runtime/constants";
import { getEventHandlerTemplate } from "#src/services/getEventHandlerTemplate";
import { getWebSocketHandlerTemplate } from "#src/services/getWebSocketHandlerTemplate";
import { getWebSocketHooksTypeTemplate } from "#src/services/getWebSocketHooksTypeTemplate";
import {
  addImports,
  addServerHandler,
  addServerTemplate,
  addTypeTemplate,
  defineNuxtModule,
  resolvePath,
} from "@nuxt/kit";

export type { ModuleOptions } from "#src/models/ModuleOptions";

declare module "@nuxt/schema" {
  interface NuxtConfig {
    trpc?: Partial<ModuleOptions>;
  }
}
// What the app imports from the client runtime without naming it, the way it reaches every other Nuxt composable
const CLIENT_IMPORTS = ["createTRPCNuxtClient", "getMutationKey", "getQueryKey", "httpBatchLink", "httpLink"] as const;
const EVENT_HANDLER_FILENAME = `#${MODULE_NAME}/eventHandler.mjs`;
const WEBSOCKET_HANDLER_FILENAME = `#${MODULE_NAME}/webSocketHandler.mjs`;

const trpcNuxtModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  defaults: { endpoint: DEFAULT_ENDPOINT },
  meta: { compatibility: { nuxt: ">=4.0.0" }, configKey: "trpc", name: MODULE_NAME },
  async setup({ createContext, endpoint, router, webSocket }, nuxt) {
    // Resolved here, through the app's aliases, since the generated handlers are bundled by Nitro, which knows none
    const resolvedRouter = { ...router, from: await resolvePath(router.from) };
    const resolvedCreateContext = createContext && { ...createContext, from: await resolvePath(createContext.from) };

    addServerTemplate({
      filename: EVENT_HANDLER_FILENAME,
      getContents: () => getEventHandlerTemplate(resolvedRouter, endpoint, resolvedCreateContext),
    });
    addServerHandler({ handler: EVENT_HANDLER_FILENAME, route: `${endpoint}/**` });

    if (webSocket) {
      nuxt.options.nitro.experimental = { ...nuxt.options.nitro.experimental, websocket: true };
      addServerTemplate({
        filename: WEBSOCKET_HANDLER_FILENAME,
        getContents: () => getWebSocketHandlerTemplate(resolvedRouter, webSocket, resolvedCreateContext),
      });
      addServerHandler({ handler: WEBSOCKET_HANDLER_FILENAME, lazy: true, route: webSocket.endpoint });
      // Server routes are typechecked in the app's context too, so the hooks are declared in both
      addTypeTemplate(
        {
          filename: `types/${MODULE_NAME}.d.ts`,
          getContents: () =>
            getWebSocketHooksTypeTemplate({ ...resolvedRouter, from: resolvedRouter.from.replace(/\.[cm]?ts$/u, "") }),
        },
        { nitro: true, nuxt: true },
      );
    }

    addImports(CLIENT_IMPORTS.map((name) => ({ from: `${MODULE_NAME}/runtime/client/${name}`, name })));
  },
});

export default trpcNuxtModule;
