# vue-canvas-frame-headless

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A headless canvas frame: `useCanvasFrame` draws its content in an isolated document at a width, scales it down to fit a narrower pane, and adopts a stylesheet into that document, with no styling of its own.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i vue-canvas-frame-headless
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs) to level up.

### Key Exports

| Export                | Kind       | Purpose                                                                                  |
| --------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `CANVAS_FRAME_SRCDOC` | const      | The document every frame starts from, before its page's markup is teleported into it     |
| `getFrameScale`       | function   | The scale that fits a frame to a pane, never above 1, and 1 while the pane is unmeasured |
| `getFrameWidth`       | function   | The frame's width: its least width, or the pane's width when it fills a wider pane       |
| `useCanvasFrame`      | composable | Draws content in an isolated document at a width, scaled down to fit a narrower pane     |

### Usage

```vue
<script setup lang="ts">
import { CANVAS_FRAME_SRCDOC, useCanvasFrame } from "vue-canvas-frame-headless";
import { useTemplateRef } from "vue";

const frame = useTemplateRef<HTMLIFrameElement>("frame");
const pane = useTemplateRef<HTMLElement>("pane");
const { frameBody, frameStyle } = useCanvasFrame({
  css: "body { margin: 0; font-family: sans-serif; }",
  fill: true,
  frame,
  pane,
  width: 992,
});
</script>

<template>
  <div ref="pane" style="height: 100%; width: 100%">
    <iframe ref="frame" :srcdoc="CANVAS_FRAME_SRCDOC" sandbox="allow-same-origin" :style="frameStyle" />
    <Teleport v-if="frameBody" :to="frameBody">
      <slot />
    </Teleport>
  </div>
</template>
```

`getFrameWidth` and `getFrameScale` are the pure geometry the composable uses, exported on their own.

## <a name="commands">⌨️ Commands</a>

```bash
pnpm build
pnpm lint
pnpm lint:fix
pnpm test
pnpm test:browser
pnpm typecheck
```

`pnpm test` runs the unit tests under happy-dom. `pnpm test:browser` runs the browser tests in a real browser, on the shared browser configuration, with no Nuxt.

## <a name="related">🔗 Related Documentation</a>

- [Vue](https://vuejs.org/guide/introduction.html)

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/vue-canvas-frame-headless/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/vue-canvas-frame-headless/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/vue-canvas-frame-headless/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/vue-canvas-frame-headless.svg
