// @TODO: no upstream issue — a <style src> still builds only through this plugin on unplugin-vue 8.0.1, whose fix for #201 resolves the stylesheet's path but leaves its id a .css request with a query, which tsdown rejects as "Bundling CSS is no longer supported" — drop this plugin once a <style src> builds without it
import type { Plugin } from "rolldown";

import { readFileSync } from "node:fs";

// `unplugin-vue` names a `<style src>` by the stylesheet's own path, and the CSS transform skips a `.css` id that
// Carries a query, so the build would reject the stylesheet. This names the component's file instead and carries the
// Stylesheet in `styleSrc`, so the component's descriptor still scopes the rules and the CSS transform takes them
// The way it takes an inline block
const STYLE_SRC_PARAM = "styleSrc";

export const vueStyleSrcPlugin: Plugin = {
  load(id) {
    const queryStart = id.indexOf("?");
    if (queryStart === -1) return null;

    const styleSrc = new URLSearchParams(id.slice(queryStart + 1)).get(STYLE_SRC_PARAM);
    if (!styleSrc) return null;

    this.addWatchFile(styleSrc);
    return readFileSync(styleSrc, "utf8");
  },
  name: "vue-style-src",
  async resolveId(id, importer) {
    const queryStart = id.indexOf("?");
    if (!importer || queryStart === -1) return null;

    const params = id.slice(queryStart + 1).split("&");
    const query = new URLSearchParams(params.join("&"));
    if (!query.has("vue") || query.get("type") !== "style" || !query.has("src")) return null;

    const resolved = await this.resolve(id.slice(0, queryStart), importer, { skipSelf: true });
    if (!resolved) return null;

    const rest = params
      .filter((param) => !param.startsWith("src="))
      .toSpliced(1, 0, `${STYLE_SRC_PARAM}=${encodeURIComponent(resolved.id)}`);
    return `${importer}?${rest.join("&")}`;
  },
};
