// `grapesjs-touch` publishes no declarations
declare module "grapesjs-touch" {
  import type { Plugin } from "grapesjs";

  const plugin: Plugin<Record<string, unknown>>;
  export default plugin;
}
