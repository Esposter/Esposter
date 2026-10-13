import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";
import type { SecurityHeaders } from "#src/models/SecurityHeaders";
import type { SecurityRules } from "#src/models/SecurityRules";
import type { H3Event } from "nitro/h3";
import type { NitroAppPlugin } from "nitro/types";

import { XFrameOptions } from "#src/models/XFrameOptions";

// A rendered docs page, the shape the app's SSR emits: a head of stylesheets, preloads, entry scripts and an inline
// State script, then a body of nested sections with their own inline scripts. Built from its shape so every bench reads
// The same bytes, and the upstream comparison reads this file too.
const SECTION_COUNT = 60;

const HEAD: string[] = [
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  "<title>Docs</title>",
  '<link rel="preload" as="font" type="font/woff2" crossorigin href="/_nuxt/fonts/inter.woff2">',
  '<link rel="stylesheet" href="/_nuxt/entry.css">',
  '<link rel="modulepreload" href="/_nuxt/entry.js">',
  '<link rel="icon" href="/favicon.ico">',
  "<style>body{margin:0}</style>",
  '<script type="application/json" id="__NUXT_DATA__">{"data":[]}</script>',
];

const createSection = (index: number): string =>
  `<section class="doc-section" data-index="${index}"><h2 id="section-${index}">Section ${index}</h2>` +
  `<p>Read <a href="/docs/section-${index}" class="link">the section</a> for the details of step ${index}.</p>` +
  `<img src="/img/step-${index}.png" alt="Step ${index}" width="640" height="360">` +
  `<pre><code class="language-ts">const step${index} = "${index}";</code></pre></section>`;

const BODY: string[] = [
  `<div id="__nuxt">${Array.from({ length: SECTION_COUNT }, (_value, index) => createSection(index)).join("")}</div>`,
  '<script type="module" src="/_nuxt/entry.js"></script>',
  '<script>window.__NUXT__={config:{app:{baseURL:"/"}}};</script>',
];

export const PAGE_SECTIONS: Record<"body" | "bodyAppend" | "bodyPrepend" | "head", string[]> = {
  body: BODY,
  bodyAppend: [],
  bodyPrepend: [],
  head: HEAD,
};

// The integrity hashes the build computed for the page's own assets, keyed by the path the markup names them with
export const PAGE_SRI_HASHES: Record<string, string> = {
  "/_nuxt/entry.css": "sha384-cGFnZS1lbnRyeS1jc3MtaGFzaC1wbGFjZWhvbGRlcg==",
  "/_nuxt/entry.js": "sha384-cGFnZS1lbnRyeS1qcy1oYXNoLXBsYWNlaG9sZGVyMQ==",
  "/_nuxt/fonts/inter.woff2": "sha384-cGFnZS1mb250LWhhc2gtcGxhY2Vob2xkZXI=",
};

// The default policy every route inherits, in the one shape the module's options and the upstream's both take
export const PAGE_CONTENT_SECURITY_POLICY: ContentSecurityPolicy = {
  "base-uri": ["'self'"],
  "connect-src": ["'self'"],
  "default-src": ["'self'"],
  "font-src": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "img-src": ["'self'", "data:"],
  "object-src": ["'none'"],
  "script-src": ["'self'", "'nonce-{{nonce}}'", "'strict-dynamic'"],
  "style-src": ["'self'", "'unsafe-inline'"],
};

// The headers every page carries before a route narrows them
export const PAGE_HEADERS: SecurityHeaders = {
  contentSecurityPolicy: PAGE_CONTENT_SECURITY_POLICY,
  crossOriginOpenerPolicy: "same-origin",
  referrerPolicy: "no-referrer",
  strictTransportSecurity: { includeSubdomains: true, maxAge: 31_536_000, preload: false },
  xContentTypeOptions: "nosniff",
  xFrameOptions: XFrameOptions.Deny,
};

// The route table the module resolves at startup: the default for every path, and three routes that narrow it
export const PAGE_ROUTE_RULES: Record<string, SecurityRules> = {
  "/**": { enabled: true, headers: PAGE_HEADERS, nonce: true, sri: true },
  "/api/**": { nonce: false },
  "/auth/**": { headers: { xFrameOptions: XFrameOptions.Deny } },
  "/docs/**": { headers: { xFrameOptions: XFrameOptions.SameOrigin } },
};

// A request's path, one the default route and a narrowed route both match, so the merge does real work
export const PAGE_PATHNAME = "/docs/section-7";

type Handler = (...args: unknown[]) => unknown;

// The hooks a plugin registers on, run the way Nitro runs them: `run` for a render hook, `callHook` for the startup one
export const createNitroApp = (): {
  nitroApp: Parameters<NitroAppPlugin>[0];
  run: (name: string, ...args: unknown[]) => void;
} => {
  const handlers = new Map<string, Handler[]>();
  const hooks = {
    async callHook(name: string, ...args: unknown[]): Promise<void> {
      // oxlint-disable-next-line no-await-in-loop -- Order is the contract: hooks run in the order they were registered
      for (const handler of handlers.get(name) ?? []) await handler(...args);
    },
    hook(name: string, handler: Handler): void {
      handlers.set(name, [...(handlers.get(name) ?? []), handler]);
    },
  };
  const run = (name: string, ...args: unknown[]): void => {
    for (const handler of handlers.get(name) ?? []) handler(...args);
  };

  // A plugin is typed by Nitro's own app, which this fake stands in for: the cast is the one place that gap is closed
  const nitroApp = { hooks } as Parameters<NitroAppPlugin>[0];
  return { nitroApp, run };
};

// A fresh request event for the page's path, the way each request arrives: its own response headers, no rules cached yet
export const createPageEvent = (): H3Event =>
  ({ res: { headers: new Headers() }, url: new URL(`http://localhost${PAGE_PATHNAME}`) }) as H3Event;

// A fresh copy of the page's sections, since a render hook replaces each section's array as it rewrites it
export const createPageHtml = (): Record<string, string[]> =>
  Object.fromEntries(Object.entries(PAGE_SECTIONS).map(([section, elements]) => [section, [...elements]]));
