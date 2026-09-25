// `grapesjs-tabs` and `grapesjs-touch` publish no types. Each default export is a plugin, so it is declared as one:
// `usePlugin` then reads the options the call site passes, rather than an import that type-checks nothing
declare module "grapesjs-tabs" {
  import type { Plugin, PluginOptions } from "grapesjs";

  const plugin: Plugin<PluginOptions>;
  export default plugin;
}

declare module "grapesjs-touch" {
  import type { Plugin } from "grapesjs";

  const plugin: Plugin;
  export default plugin;
}
