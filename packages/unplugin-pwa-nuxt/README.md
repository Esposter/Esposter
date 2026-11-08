# unplugin-pwa-nuxt

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

This package is a Nuxt PWA module on [`@unplugin-pwa/vite`](https://github.com/vite-pwa/unplugin-pwa), for Nuxt 5 and Nitro 3 only. It builds your service worker once Nitro has copied the app into its public folder, so its precache lists every file the server serves, keeps the worker from answering a navigation to a route your server owns, links the manifest in the page's head and registers the worker with a client plugin that provides `$pwa`.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/unplugin-pwa-nuxt).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- 📝 [Usage](#usage)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i unplugin-pwa-nuxt @vite-pwa/workbox-window
```

The engine's register code is a virtual module whose imports Vite resolves from your app's root, so the app installs `@vite-pwa/workbox-window` itself.

```ts
// nuxt.config.ts
export default defineNuxtConfig({ modules: ["unplugin-pwa-nuxt"] });
```

## <a name="key-exports">🧩 Key Exports</a>

| Export                                          | Kind      | Purpose                                                                                                                         |
| :---------------------------------------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `default`                                       | const     | The Nuxt module, set up from the `pwa` config key                                                                               |
| `ModuleOptions`                                 | interface | The engine's own options, typed and unchanged, plus `periodicSyncForUpdates`, the seconds between checks for a newer worker     |
| `Pwa`                                           | interface | `$pwa`, with `needRefresh`, `offlineReady`, `registrationError` and `updateServiceWorker()`                                     |
| `virtual:unplugin-pwa-nuxt/navigation-denylist` | module    | The server's routes as `RegExp`s, imported by a worker built from source; its types are `unplugin-pwa-nuxt/navigation-denylist` |

## <a name="usage">📝 Usage</a>

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["unplugin-pwa-nuxt"],
  pwa: {
    // The worker is TypeScript, built with its precache list injected
    buildSW: { swSrc: "service-worker/sw.ts" },
    manifest: { name: "My app", short_name: "App", theme_color: "#ffffff" },
    // A new worker waits until `$pwa.updateServiceWorker()` is called
    registerType: "prompt",
    strategies: "buildSW",
    // Checks for a newer worker hourly, so a tab left open for days is offered it
    periodicSyncForUpdates: 3600,
  },
});
```

```ts
// service-worker/sw.ts
/// <reference types="unplugin-pwa-nuxt/navigation-denylist" />
import { navigationDenylist } from "virtual:unplugin-pwa-nuxt/navigation-denylist";
import { createHandlerBoundToURL, precacheAndRoute } from "@vite-pwa/workbox-swkit/precaching";
import { NavigationRoute, registerRoute } from "@vite-pwa/workbox-swkit/routing";

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: { revision: null | string; url: string }[] };

precacheAndRoute([...self.__WB_MANIFEST, { revision: null, url: "/" }]);
// An API route or a file the server serves is the server's to answer, not the shell's
registerRoute(new NavigationRoute(createHandlerBoundToURL("/"), { denylist: navigationDenylist }));
// `$pwa.updateServiceWorker()` sends this message, and a worker built from source is the one that must act on it
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
});
```

```vue
<script setup lang="ts">
const { $pwa } = useNuxtApp();
</script>

<template>
  <button v-if="$pwa?.needRefresh" @click="$pwa.updateServiceWorker()">Reload for the new version</button>
</template>
```

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/unplugin-pwa-nuxt/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/unplugin-pwa-nuxt/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/unplugin-pwa-nuxt/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/unplugin-pwa-nuxt.svg
