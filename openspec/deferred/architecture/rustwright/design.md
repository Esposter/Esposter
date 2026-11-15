# Rustwright

Replace Playwright with Rustwright, Skyvern's Chromium automation engine written in Rust, in both places the repo drives a browser: the parity tooling in `scripts`, which opens the parity page in the machine's Edge (`scripts/src/services/genshinParity/shared/openParityPage.ts`), and Vitest's browser mode, which runs every `*.browser.test.ts` suite through `@vitest/browser-playwright` (`packages/configuration/src/services/getVitestBrowserConfiguration.ts`). Rustwright speaks the DevTools protocol in-process and keeps Playwright's API, so a script changes its import and nothing else, within the part of the API it covers. It is alpha, Chromium only, and ships Python and Node bindings. The Node binding is the one this repo could use, and it is the weaker of the two.

The Node binding bridges launching, `evaluate` and screenshots, and nothing else the repo calls: the CDP session, the init script, the route, `waitForFunction` and `connectOverCDP` are all undefined. A context isolates nothing either, so the parity page's per-run context would share storage with every other run. The swap is therefore not a drop-in change today.

Vitest's `BrowserProvider` interface is public, so a Rustwright provider is possible in principle. The provider's body is the cost. `@vitest/browser-playwright` implements every browser command a test calls, clicks, typing, frame locators, element screenshots, tracing and request routing, as calls on Playwright's frames, contexts, mouse and keyboard. A Rustwright provider would implement all of that over a binding that bridges none of it.

## Why not now

The reported gain is 2.55 times faster and 70 percent less memory, from the project's own diagnostics on its own workload. A parity run spends its time rendering a WebGPU page and reading its pixels, and a browser test spends it in the browser, so the driver's share of either is likely small and unmeasured here. The cost is two consumers rewritten against an alpha binding, plus a provider package. The trade is the wrong way round until the binding catches up.

## Revisit when

A Rustwright release whose Node typings declare the surface the parity tooling calls: a CDP session, an init script, `waitForFunction`, request routing, page events, a real context and `connectOverCDP`. The open request to bring the Node binding to the Python binding's coverage tracks that gap (Skyvern-AI/rustwright, the issue titled "Expand Node.js Bindings to Match Python Coverage").

A revival goes in two steps, each its own change:

1. **The parity tooling.** Swap the driver in `scripts` only, and require every parity command's committed output to match what Playwright wrote for the same references, then time a `compare` run and its memory against Playwright's before keeping the swap.
2. **The Vitest provider.** Write it only once the binding has frames and input, and only if step 1 showed a gain worth a package. Until then `@vitest/browser-playwright` stays.

Playwright keeps both jobs meanwhile; there is no interim to build.

## Sources

- The Rustwright repository's README, its limitations page and its parity page state the alpha status, the Chromium-only scope, the Node binding's short list of bridged methods, and the 96 percent method coverage of the Python binding that the Node binding lacks.
- The Node binding's bridged surface, read by calling the released binding against the machine's Chrome and Edge.
