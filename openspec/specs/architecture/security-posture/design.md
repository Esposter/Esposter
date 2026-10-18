# Security Posture

The app's runtime hardening is [`nuxt-security-module`](../../nuxt-security-module/README.md), which replaces nuxt-security and is registered in `configuration/modules.ts`. It appears only in the production branch of that list: the Vitest branch is an allowlist of the modules a unit test actually exercises, and security headers are something no test asserts, so including the module would only slow config resolution. Nothing about the posture is therefore observable from a unit test — it is a property of a running server.

This page covers the **app**. The Azure estate's posture — network exposure, managed identities, key handling — is owned by the [cost and security posture](../../infra/cost-and-security-posture/design.md).

## How it works

```mermaid
flowchart TD
  modules["configuration/modules.ts — production branch only"] -->|"registers nuxt-security-module"| module["nuxt-security-module"]
  config["configuration/security.ts"] -->|"headers, requestSizeLimiter"| module
  module -->|"Content-Security-Policy and Permissions-Policy"| response["every response"]
  module -->|"rejects an oversized body before the handler"| upload["request size limit"]
  response --> browser["browser enforces the policy"]
  module -->|"integrity hash on every script"| browser
  experimental["configuration/experimental.ts"] -->|"entryImportMap false"| names["a chunk's name changes with its bytes"]
  names --> browser
  assetHook["server/plugins/nuxtAssets.ts"] -->|"Cross-Origin-Embedder-Policy on /_nuxt/*.js"| worker["a dedicated worker's script"]
  worker --> browser
  config -.->|"rateLimiter false"| rate["app's own rate limiting"]
  config -.->|"no XSS validator in the module"| xss["rich text sanitised at its Zod boundary"]
```

### Content Security Policy

`img-src` is `'self'`, `data:`, `blob:` and `https:` — any image served over HTTPS, as [the image policy](#the-image-policy) below sets out. `script-src` carries `'unsafe-eval'`, which Desmos requires to evaluate the expressions it is given; the separate `script-src-elem` and `style-src-elem` lists enumerate the third-party origins actually loaded (Desmos, GrapesJS, MediaPipe's track processors) with a comment naming the dependency behind each entry, so an entry whose dependency is removed is obvious. No font origin is listed: `@nuxt/fonts` fetches each family's stylesheet on the server, at build and in dev, and serves the files as build assets from the app's own `/_nuxt/fonts`, so the browser never contacts the font host. `worker-src` allows `'self'` for the PDF viewer's worker and `blob:` for the one Desmos constructs at runtime.

`connect-src` and `media-src` are written in the security config as well, since `default-src 'self'` would otherwise cover them: `connect-src` names `blob:` for Three.js GLTFLoader's embedded textures, the Azure container, the LiveKit socket and its HTTPS region lookup, Web PubSub, and the two hosts `@livekit/track-processors` fetches its wasm and segmenter model from; `media-src` names the container and `blob:`. Each entry carries its reason beside it in `configuration/security.ts`, and `configuration/security.test.ts` pins them.

### Embedder policy

The module sends `Cross-Origin-Embedder-Policy` on rendered pages only, never on a static asset, with the value its [defaults review](../../nuxt-security-module/defaults-review/design.md) records for each environment. A page under an embedder policy can start a dedicated worker only when the worker's script sends one as well, so without it every `?worker` import fails in production and nowhere else. `server/plugins/nuxtAssets.ts` adds the production policy to built JavaScript requests under `/_nuxt/` through Nitro's request hook before Nitro handles the static asset.

A route-rule pattern would overlap Nuxt AI Ready's `/**.md` cache rule, which is why the policy is set in the hook instead.

A header change to those scripts never reaches a copy already cached. They are served `immutable` for a year, and the host's edge keeps its own copy for each `Accept-Encoding`, so a script cached before the change goes on being served without the new header until the edge's cache is purged, and a browser that fetched it meanwhile keeps its copy until its own cache is cleared. A file the change also renames is the exception, since no cache holds its new name.

### Subresource integrity

The module's `sri` is left at its default, so every script the page loads carries an `integrity` hash, and the scripts under `/_nuxt/` are served `immutable` and cached by the host's edge besides. That holds only while a file name never outlives its bytes, which Nuxt's `experimental.entryImportMap` breaks: under it a chunk imports the entry as `#entry`, so the chunk's hash leaves the entry's out, while Vite writes the entry's hashed name into the chunk's preload list after hashing. A deploy that changed only the entry shipped a chunk under its old name with new bytes, a browser or edge holding the old bytes failed the new integrity hash, and the page never booted. `configuration/experimental.ts` turns the import map off, so a changed entry renames every chunk that reaches it.

### Permissions policy

`permissionsPolicy` scopes `camera`, `microphone`, `display-capture` and `fullscreen` to `self`. The first three exist for LiveKit — [voice and video](../../esbabbler/voice-video/design.md) cannot acquire tracks without them — and `fullscreen` for the PDF viewer. Scoping to `self` rather than leaving them at the module default means an embedded third-party frame cannot inherit the app's grant.

### Request size

`requestSizeLimiter` is wired to `MAX_REQUEST_SIZE` and `MAX_FILE_REQUEST_SIZE`, the same constants that bound the tRPC body and the upload SAS. Those values and the upload path they govern are documented in [file uploads](../file-uploads/design.md) — this config is only where the module is told about them.

### The image policy

Members post arbitrary image links to each other, in a message or inside a resource's page or email, and an allowlist cannot enumerate the web, so `img-src` takes `https:` on every route. A narrower policy per route cannot hold here: the app navigates on the client, so the document a session first loaded carries its policy to every page opened after it, and a room reached from the home page would keep the home page's list. An earlier per-route widening under the messages route is rejected for exactly that, and it never took effect besides: the header served under the messages route carried the narrow list all the same.

The accepted cost is a privacy one, and it is accepted rather than unnoticed: a rendered image is a request the viewer's browser makes to whatever origin the poster chose, so that origin learns every viewer's IP address and the moment they opened the room or the resource. Nothing mitigates it today. The only real fix is proxying message images through the app, which trades the leak for bandwidth, a cache and a fetch-side SSRF surface — worth revisiting when rooms hold people who do not already trust each other, not before.

## Deliberately off

- **`rateLimiter: false`** — the module ships an in-memory rate limiter, and the app has its own Postgres-backed one that is shared across instances. Two mechanisms would mean two answers to the same question, so the module's is disabled and [rate limiting](../rate-limiting/design.md) is the single mechanism. better-auth is handed the same numbers but keeps its own per-process counters, which that page records.
- **`xssValidator: false`** — the validator runs every request body through `FilterXSS` and rejects the request if the filter would change it, which is the wrong test for this app in both directions. Under its default options it rejects ordinary text a message carries — `i <3 you`, `a < b`, a password containing `<` — and every mention the rich-text editor writes, whose attributes it strips; with `escapeHtml` turned off to let those through, it passes a `<script>` tag. That measurement was taken against the `xss` package the module uses, which the app no longer depends on, so no test keeps it. What the app does instead is sanitise rich text where it enters, at the Zod schemas every message, webhook body and post description passes through (`packages/shared/src/services/sanitizeHtml/sanitizeTextHtml.ts`), so what is stored is already what may be rendered. The validator once also starved the tRPC handler of the body it had read, which h3 2.x makes the rule rather than a defect: a request's body is a stream read once, so a middleware that consumes it owns it, and with the validator off nothing in front of the [tRPC module's](../../trpc-nuxt-module/README.md) handler reads it.

## Key files

Paths relative to `apps/web`.

| File                               | Role                                                                |
| ---------------------------------- | ------------------------------------------------------------------- |
| `configuration/modules.ts`         | registers `nuxt-security-module` in the production module list only |
| `configuration/security.ts`        | CSP, permissions policy, request size limits, disabled features     |
| `server/plugins/nuxtAssets.ts`     | the embedder policy on built scripts, so a dedicated worker starts  |
| `configuration/experimental.ts`    | the entry import map off, so a chunk's name changes with its bytes  |
| `shared/services/app/constants.ts` | `MAX_REQUEST_SIZE` and `MAX_FILE_REQUEST_SIZE`                      |
