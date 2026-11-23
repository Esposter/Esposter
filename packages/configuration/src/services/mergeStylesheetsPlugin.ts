import type { Plugin } from "rolldown";

import { STYLESHEET_REQUEST_REGEX } from "#src/services/constants";
import { mergeStylesheets } from "#src/services/mergeStylesheets";

// The CSS of an unbundled build is joined into one `style.css` by tsdown as rolldown renders each chunk, and rolldown
// Renders chunks in parallel, so the rules' order moved between builds of one tree. This plugin records each
// Stylesheet's Source and the chunks that render it, then writes `style.css` again in module-id order. It runs `post`,
// After tsdown's Own generate step, so the file it replaces is the one tsdown emitted
const STYLESHEET_BUNDLE_NAME = "style.css";

// An inline stylesheet import is a JavaScript string, not a rule the bundle joins
const INLINE_QUERY_REGEX = /[?&]inline\b/u;

export const mergeStylesheetsPlugin = (): Plugin => {
  const sources = new Map<string, string>();
  const renderedSources = new Map<string, string>();

  return {
    buildStart() {
      sources.clear();
      renderedSources.clear();
    },
    generateBundle: {
      handler(_outputOptions, bundle) {
        const bundledStylesheet = bundle[STYLESHEET_BUNDLE_NAME];
        if (bundledStylesheet?.type !== "asset") return;

        bundledStylesheet.source = mergeStylesheets(Array.from(renderedSources, ([id, source]) => ({ id, source })));
      },
      order: "post",
    },
    name: "merge-stylesheets",
    renderChunk(_code, chunk) {
      for (const id of Object.keys(chunk.modules)) {
        const source = sources.get(id);
        if (source !== undefined) renderedSources.set(id, source);
      }
    },
    transform: {
      filter: { id: STYLESHEET_REQUEST_REGEX },
      handler(code, id) {
        if (!INLINE_QUERY_REGEX.test(id) && code.length > 0) sources.set(id, code);
      },
    },
  };
};
