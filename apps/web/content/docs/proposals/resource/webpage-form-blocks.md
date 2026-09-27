---
title: Webpage form blocks
description: Proposal — the Webpage editor stops offering the Forms plugin's blocks, which build a form the published page's sandbox can never submit, while keeping its component types so pages that already hold a form load unchanged; the survey invite block is the way a published page collects answers.
model: claude-opus-5-5
---

# Webpage Form Blocks

`WebpageEditorPlugins` registers `grapesjs-plugin-forms`, so the block manager offers a Form, an Input, a Textarea, a Select, a Checkbox, a Radio, a Button and a Label, and the trait manager a form's method and action. A published webpage renders inside `ResourceSrcdocIframe`, whose sandbox is `allow-scripts` alone — without `allow-forms`, a browser blocks every form submission in the frame. So a person can build a sign-up form in the editor, publish it, and every visitor who presses its button submits nothing, with no error to either side.

Allowing it is not the fix: a form's action posts wherever its author points it, and the app would host a page collecting visitors' input for an address it knows nothing about. Collecting answers is what the Survey type is for, and a webpage already links one through its [survey invite blocks](/docs/resource/webpage-survey-invite-blocks).

## What it changes

- **The plugin stays, its blocks go**: `usePlugin(grapesJSPluginForms, { blocks: [] })` in `WebpageEditorPlugins`, so the Forms category is gone from the block manager.
- **The plugin cannot be removed outright.** A saved page's project data names each form component by the plugin's type and not its tag, and a type no longer registered loads as the default component — checked in a headless editor, a saved `<form>` with its input and button reloads as three `<div>`s, changing the page and its published render. With the types kept and no blocks, the same saved form reloads byte-identical.
- **The survey invite block is the answer where a form was wanted**, and the survey invite page says so in one line.

The same holds for every plugin the roadmap's later pruning of the page-builder belt weighs: one that registers a component type a saved page may hold keeps its types, or the pruning migrates those pages first.

## Key files

| File                                                             | Role after the change                             |
| ---------------------------------------------------------------- | ------------------------------------------------- |
| `apps/web/app/services/webpageEditor/WebpageEditorPlugins.ts`    | Forms plugin registered with its blocks disabled  |
| `apps/web/app/components/Resource/SrcdocIframe.vue`              | unchanged: its sandbox is why forms cannot submit |
| `apps/web/content/docs/resource/webpage-survey-invite-blocks.md` | names the invite block as the form replacement    |

## Sources

- [MDN — iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox) — without `allow-forms`, form submission in the frame is blocked.
