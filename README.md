# [Esposter](https://esposter.com)

[![Build Status][badge-ci]][url-ci]
[![Duplicate Code][badge-duplicates]][url-ci]
[![Repository Score][badge-score]][url-score]
[![OpenSSF Scorecard][badge-openssf]][url-openssf]
[![skills.sh installs][badge-skills]][url-skills]
[![Apache-2.0 licensed][badge-license]][url-license]

## Table of Contents

- 📖 [Documentation](#documentation)
- 🏠 [Local Development](#local-development)
- 🧱 [Architecture](#architecture)
- 📦 [Packages](#packages)
- 🔌 [Claude Code Plugins](#claude-code-plugins)
- 🤝 [Community](#community)
- ⚖️ [License](#license)

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs) to level up.

### Frontend

<table>
  <thead>
    <tr>
      <th width="2000" colspan="2">
        <img src="./.github/assets/nuxt/banner.png" />
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="80" align="center" valign="top">
        <br />
        <a href="https://nuxt.com">
          <img src="./.github/assets/nuxt/logo.svg" />
        </a>
      </td>
      <td valign="top">
        <h3>Nuxt</h3>
        <p>
          The Intuitive Web Framework, based on Vue.
        </p>
      </td>
    </tr>
    <tr>
      <td width="80" align="center" valign="top">
        <br />
        <a href="https://vuejs.org">
          <img src="./.github/assets/vue/logo.svg" />
        </a>
      </td>
      <td valign="top">
        <h3>Vue</h3>
        <p>
          🖖 Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.
        </p>
      </td>
    </tr>
    <tr>
      <td width="80" align="center" valign="top">
        <br />
        <a href="https://0.vuetifyjs.com">
          <img src="./.github/assets/vuetify/logo.svg" />
        </a>
      </td>
      <td valign="top">
        <h3>Vuetify 0</h3>
        <p>
          🐉 Headless building blocks for Vue, under the app's own UI library.
        </p>
      </td>
    </tr>
    <tr>
      <td width="80" align="center" valign="top">
        <br />
        <a href="https://pinia.vuejs.org">
          <img src="./.github/assets/pinia/logo.svg" />
        </a>
      </td>
      <td valign="top">
        <h3>Pinia</h3>
        <p>
          🍍 Intuitive, type safe, light and flexible Store for Vue using the composition api with DevTools support.
        </p>
      </td>
    </tr>
  </tbody>
</table>

### Backend

<table>
  <thead>
    <tr>
      <th width="2000" colspan="2">
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="80" align="center" valign="top">
        <br />
        <a href="https://trpc.io">
          <img src="./.github/assets/trpc/logo.svg" />
        </a>
      </td>
      <td>
        <h3>tRPC</h3>
        <p>
          🧙‍♀️ Move Fast and Break Nothing. End-to-end typesafe APIs made easy.
        </p>
      </td>
    </tr>
    <tr>
      <td width="80" align="center" valign="top">
        <br />
        <a href="https://zod.dev">
          <img src="./.github/assets/zod/logo.svg" />
        </a>
      </td>
      <td>
        <h3>Zod</h3>
        <p>
          TypeScript-first schema validation with static type inference.
        </p>
      </td>
    </tr>
    <tr>
      <td width="80" align="center" valign="top">
        <br />
        <a href="https://orm.drizzle.team">
          <img src="./.github/assets/drizzle/logo.svg" />
        </a>
      </td>
      <td valign="top">
        <h3>Drizzle ORM</h3>
        <p>
          TypeScript ORM that feels like writing SQL.
        </p>
      </td>
    </tr>
    <tr>
      <td width="80" align="center" valign="top">
        <br />
        <a href="https://www.postgresql.org">
          <img src="./.github/assets/postgresql/logo.svg" />
        </a>
      </td>
      <td valign="top">
        <h3>PostgreSQL</h3>
        <p>
          PostgreSQL is a powerful, open source object-relational database system with over 35 years of active development that has earned it a strong reputation for reliability, feature robustness, and performance.
        </p>
      </td>
    </tr>
  </tbody>
</table>

### Infrastructure

<table>
  <thead>
    <tr>
      <th width="2000" colspan="2">
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="80" align="center" valign="top">
        <br />
        <a href="https://www.pulumi.com">
          <img src="./.github/assets/pulumi/logo.svg" />
        </a>
      </td>
      <td valign="top">
        <h3>Pulumi</h3>
        <p>
          Infrastructure as Code in any programming language.
        </p>
      </td>
    </tr>
  </tbody>
</table>

### Hosting & Domain Providers

<table>
  <thead>
    <tr>
      <th width="2000" colspan="2">
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="80" align="center" valign="top">
        <br />
        <a href="https://railway.app">
          <img src="./.github/assets/railway/logo.svg" />
        </a>
      </td>
      <td>
        <h3>Railway</h3>
        <p>
          Infrastructure, Instantly.
        </p>
      </td>
    </tr>
    <tr>
      <td width="80" align="center" valign="top">
        <br />
        <a href="https://www.namecheap.com">
          <img src="./.github/assets/namecheap/logo.svg" />
        </a>
      </td>
      <td valign="top">
        <h3>Namecheap</h3>
        <p>
          ICANN-accredited domain name registrar providing domain name registration and web hosting.
        </p>
      </td>
    </tr>
  </tbody>
</table>

### VSCode Extensions

| Name                       | Link                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------- |
| Better Comments            | https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments          |
| UnoCSS                     | https://marketplace.visualstudio.com/items?itemName=antfu.unocss                        |
| ESLint                     | https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint              |
| GitLens — Git supercharged | https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens                     |
| GitHub Actions             | https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-actions        |
| Azure Functions            | https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions |
| Powershell                 | https://marketplace.visualstudio.com/items?itemName=ms-vscode.PowerShell                |
| Oxfmt - Code formatter     | https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode                      |
| Material Icon Theme        | https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme           |
| Vue - Official (Volar)     | https://marketplace.visualstudio.com/items?itemName=Vue.volar                           |

## <a name="local-development">🏠 Local Development</a>

### Git configuration to enable symlinks

The projects make use of symlinks in the git project. On Windows, this may not work as expected without extra configuration. To configure git to create symlinks on windows, you need to enable the Windows "Developer Mode" setting, and also set the `core.symlinks` git feature using either of the following commands:

```bash
# Global setting
git config --global core.symlinks true

# Local setting
git config core.symlinks true
```

After applying this setting, you may need to reset your local branch to ensure the files get rewritten as symlinks. Note that this step is destructive and you will want to push any changes you have made prior to resetting your branch.

```bash
git reset --hard
```

### Installing Dependencies

1. Install the global [Vite+](https://viteplus.dev/guide/) CLI, then the node and pnpm versions the repository pins:

```bash
vp env install
```

2. Install Node Modules:

```bash
pnpm i
```

3. Install [PostgreSQL + PgAdmin](https://www.postgresql.org/download).

4. Add `.env` file according to `.env.example` in `apps/web` directory.

Checkout the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

### Development Server

1. Build the packages to be used by the application:

```bash
vp run build:packages
```

2. Change to the app directory:

```bash
cd apps/web
```

3. Start the development server on <http://localhost:3000>

```bash
pnpm dev
```

### Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

## <a name="architecture">🧱 Architecture</a>

Esposter is a pnpm workspaces monorepo. See [monorepo tooling](https://github.com/Esposter/Esposter/blob/main/apps/web/content/docs/architecture/monorepo-tooling.md) for workspace script orchestration and publishing boundaries.
Packages are used directly by the nuxt application via `workspace:*`.

### Workspace Graph

[![Workspace dependency graph](./dependency-graph.svg)](https://github.com/Esposter/Esposter/blob/main/dependency-graph.svg)

Each node's hue and tint are the role its edges give it, darkest at what the repo ships and lightest at what
the rest of it stands on; the key is drawn into the image.
Regenerate it from the repo root with:

```bash
pnpm graph:gen
```

### Review

AI sessions commit faster than any reviewer reads, so nothing between a commit and a reviewed release waits on a
person. Each session lands its commits on the one permanent `ai/queue` branch with `git pull --rebase origin ai/queue` and `git push origin HEAD:ai/queue`. A GitHub Actions workflow
then reviews what landed there: it takes the commits `main` does not have yet in windows of at most 300 changed files,
has headless Haiku reviewers read each window in batches of files they can read whole, and fast-forwards `main` to the
window's last commit. Each window that passes opens an issue for its findings. A fixer session then fixes what it can and
lands its commits on `ai/queue`, and a settler session settles what the fixer left open, so every finding ends fixed,
refuted or recorded. The design and the figures live in
[the review docs](https://github.com/Esposter/Esposter/blob/main/apps/web/content/docs/infra/review.md).

```mermaid
flowchart LR
  S[AI sessions] -->|git push to ai/queue| Q[(ai/queue)]
  Q -->|window of commits| R[Haiku reviewers]
  R -->|window passed: fast-forward| M[(main)]
  R -->|findings| I[Review issue]
  I -->|fixer, then settler: commits| Q
```

## <a name="packages">📦 Packages</a>

> [!WARNING]
> The published packages are built for this repository first. Use them at your own risk: their APIs may change in any release, without a deprecation period, in pursuit of better performance and simpler code.

| Package                                                                                                         | Description                                                                                                                                                                     | Published |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: |
| [`apps/functions`](https://github.com/Esposter/Esposter/tree/main/apps/functions)                               | Serverless Azure Functions backend — push notifications, webhooks, EventGrid                                                                                                    |     —     |
| [`apps/infra`](https://github.com/Esposter/Esposter/tree/main/apps/infra)                                       | Pulumi infrastructure code and migration tools for Azure resources                                                                                                              |     —     |
| [`apps/web`](https://github.com/Esposter/Esposter/tree/main/apps/web)                                           | Main Nuxt web application — frontend, server routes, tRPC API                                                                                                                   |     —     |
| [`packages/agent-console-server`](https://github.com/Esposter/Esposter/tree/main/packages/agent-console-server) | Agent console host — Claude Code sessions over a token-gated loopback WebSocket                                                                                                 |     ✓     |
| [`packages/azure`](https://github.com/Esposter/Esposter/tree/main/packages/azure)                               | Azure wire conventions — OData filter clauses, entity key casing, service limits                                                                                                |     ✓     |
| [`packages/azure-mock`](https://github.com/Esposter/Esposter/tree/main/packages/azure-mock)                     | Mock Azure service classes for local dev and testing                                                                                                                            |     ✓     |
| [`packages/configuration`](https://github.com/Esposter/Esposter/tree/main/packages/configuration)               | Shared ESLint, TSConfig, and tsdown build configurations                                                                                                                        |     —     |
| [`packages/db`](https://github.com/Esposter/Esposter/tree/main/packages/db)                                     | Database connection utilities for Drizzle ORM, Azure Table, Blob, and WebPubSub                                                                                                 |     —     |
| [`packages/db-mock`](https://github.com/Esposter/Esposter/tree/main/packages/db-mock)                           | In-memory PGlite database factory for unit and integration tests                                                                                                                |     —     |
| [`packages/db-schema`](https://github.com/Esposter/Esposter/tree/main/packages/db-schema)                       | Drizzle ORM schemas and migrations (PostgreSQL source of truth)                                                                                                                 |     —     |
| [`packages/follow-ups`](https://github.com/Esposter/Esposter/tree/main/packages/follow-ups)                     | Claude Code plugin — a session's unfinished follow-ups written into a TodoList and drained until none is left                                                                   |     —     |
| [`packages/genshin-engine`](https://github.com/Esposter/Esposter/tree/main/packages/genshin-engine)             | Anime-style open-world engine for three.js WebGPU — toon materials, outlines, post-processing, world kits and music                                                             |     ✓     |
| [`packages/genshin-interface`](https://github.com/Esposter/Esposter/tree/main/packages/genshin-interface)       | Genshin's 2D interface — the screen root, its units and pointer, and the pieces the game's screens share                                                                        |     ✓     |
| [`packages/genshin-mods`](https://github.com/Esposter/Esposter/tree/main/packages/genshin-mods)                 | Claude Code plugin — six mods under one band: next steps, cache and usage with a one-click handoff, recording mode, a goal meter, a collision guard and a delegation guard      |     ✓     |
| [`packages/genshin-persona`](https://github.com/Esposter/Esposter/tree/main/packages/genshin-persona)           | Claude Code plugin — a Genshin character picked by birthday, replies spoken in its own cloned voice                                                                             |     ✓     |
| [`packages/genshin-text`](https://github.com/Esposter/Esposter/tree/main/packages/genshin-text)                 | The game's own text in its fifteen languages — the language registry, a locale matcher, and the game's strings by text id                                                       |     ✓     |
| [`packages/genshin-world`](https://github.com/Esposter/Esposter/tree/main/packages/genshin-world)               | Genshin's world on the engine — the region catalogue, each region's data, the TresJS components and the interface screens                                                       |     ✓     |
| [`packages/keyframe-store`](https://github.com/Esposter/Esposter/tree/main/packages/keyframe-store)             | Content-addressed version store — zstd keyframes and deltas over any backend                                                                                                    |     ✓     |
| [`packages/nuxt-security-module`](https://github.com/Esposter/Esposter/tree/main/packages/nuxt-security-module) | Nuxt security module for Nitro 3 and h3 2 — security headers, a nonce Content Security Policy, subresource integrity, CORS, basic auth, a rate limiter and a request size limit |
| [`packages/parse-tmx`](https://github.com/Esposter/Esposter/tree/main/packages/parse-tmx)                       | Parser for Tiled Map Editor `.tmx` files                                                                                                                                        |     ✓     |
| [`packages/pitch-transcription`](https://github.com/Esposter/Esposter/tree/main/packages/pitch-transcription)   | The notes in a recording — Basic Pitch on the current TensorFlow.js, its readings turned into notes, bends and MIDI                                                             |     ✓     |
| [`packages/shared`](https://github.com/Esposter/Esposter/tree/main/packages/shared)                             | Shared TypeScript types, utilities, and error classes                                                                                                                           |     ✓     |
| [`packages/shared-node`](https://github.com/Esposter/Esposter/tree/main/packages/shared-node)                   | Node-only shared tooling — the machine-wide download cache, hidden-window child processes and benchmark reporting for vitest bench runs                                         |     —     |
| [`packages/trpc-msw`](https://github.com/Esposter/Esposter/tree/main/packages/trpc-msw)                         | tRPC for Mock Service Worker — every transport answered by tRPC's own handlers                                                                                                  |     ✓     |
| [`packages/trpc-nuxt-module`](https://github.com/Esposter/Esposter/tree/main/packages/trpc-nuxt-module)         | tRPC for Nuxt — a module registering the router's HTTP and WebSocket handlers, with composables over `useAsyncData`                                                             |     ✓     |
| [`packages/vue-phaserjs`](https://github.com/Esposter/Esposter/tree/main/packages/vue-phaserjs)                 | Phaser game engine integration for Vue                                                                                                                                          |     ✓     |
| [`scripts`](https://github.com/Esposter/Esposter/tree/main/scripts)                                             | The repository's own tooling — workspace graph, dependency report, sweep scans                                                                                                  |     —     |

## <a name="claude-code-plugins">🔌 Claude Code Plugins</a>

This repository is also a Claude Code plugin marketplace named `esposter`, declared in [`.claude-plugin/marketplace.json`](https://github.com/Esposter/Esposter/blob/main/.claude-plugin/marketplace.json). Anyone adds it by the repository's GitHub name and installs a plugin by its marketplace name:

```bash
claude plugin marketplace add Esposter/Esposter
claude plugin install genshin-persona@esposter
claude plugin install genshin-mods@esposter
```

| Plugin                                                                                       | What it does                                                                                                                                                                                                                                                                                                                                                                                          |
| :------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`genshin-mods`](https://github.com/Esposter/Esposter/tree/main/packages/genshin-mods)       | Six mods: five under one band above the prompt, waypoints (the next steps, one press each), resin (cache, context, limits and cost, with warm, compact and a one-click handoff), veil (recording mode), commission (a goal's task list and clock) and ward (a question before editing a file another session just changed), and a delegation guard that nudges a run of lookups toward a haiku agent. |
| [`genshin-persona`](https://github.com/Esposter/Esposter/tree/main/packages/genshin-persona) | Speaks as the Genshin Impact character whose birthday is nearest to today, in prose only, and reads each reply aloud, a sentence at a time, in the character's own cloned voice.                                                                                                                                                                                                                      |

A plugin here is an ordinary workspace package, so it is formatted, linted, tested and dependency-bumped with everything else, and a merge to `main` is its release: an installed copy follows the marketplace on the next plugin update. How that is built, and what it deliberately does not do, is on the [Claude interface](https://esposter.com/docs/infra/claude-interface) page.

## <a name="community">🤝 Community</a>

We welcome contributions from everyone and are committed to maintaining a friendly, safe, and welcoming community. Please see our [Code of Conduct](CODE_OF_CONDUCT.md) and [Security Policy](SECURITY.md) for more information.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-ci]: https://github.com/Esposter/Esposter/actions/workflows/CI.yaml/badge.svg?event=push&branch=main
[url-ci]: https://github.com/Esposter/Esposter/actions/workflows/CI.yaml?query=event%3Apush+branch%3Amain
[badge-duplicates]: https://img.shields.io/badge/duplicate%20code-0%20clones-33c854
[badge-score]: https://img.shields.io/badge/score-94%2F100-33c854
[url-score]: https://github.com/Esposter/Esposter/blob/main/SCORE.md
[badge-openssf]: https://api.scorecard.dev/projects/github.com/Esposter/Esposter/badge
[url-openssf]: https://scorecard.dev/viewer/?uri=github.com/Esposter/Esposter
[badge-skills]: https://skills.sh/b/Esposter/Esposter
[url-skills]: https://skills.sh/Esposter/Esposter
[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[url-npm]: https://www.npmjs.com/package/Esposter/v/latest
