// `grapesjs-tabs` publishes no declarations
declare module "grapesjs-tabs" {
  import type { Plugin } from "grapesjs";

  const plugin: Plugin<Record<string, unknown>>;
  export default plugin;
}
