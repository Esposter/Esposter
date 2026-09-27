---
title: Webpage form blocks
description: Proposal — the Webpage editor drops the Forms plugin, whose form, input and button blocks build a form the published page's sandbox can never submit; the survey invite block is the way a published page collects answers.
model: claude-opus-5-5
---

# Webpage Form Blocks

`WebpageEditorPlugins` registers `grapesjs-plugin-forms`, so the block manager offers a Form, an Input, a Textarea, a Select, a Checkbox, a Radio, a Button and a Label, and the trait manager a form's method and action. A published webpage renders inside `ResourceSrcdocIframe`, whose sandbox is `allow-scripts` alone — without `allow-forms`, a browser blocks every form submission in the frame. So a person can build a sign-up form in the editor, publish it, and every visitor who presses its button submits nothing, with no error to either side.

Allowing it is not the fix: a form's action posts wherever its author points it, and the app would host a page collecting visitors' input for an address it knows nothing about. Collecting answers is what the Survey type is for, and a webpage already links one through its [survey invite blocks](/docs/resource/webpage-survey-invite-blocks).

## What it changes

- **`grapesjs-plugin-forms` leaves `WebpageEditorPlugins`** and the app's manifest, so the Forms category is gone from the block manager.
- **A webpage that already holds form components keeps its markup.** GrapesJS loads a component whose type is no longer registered as a default element with its tag, attributes and children, so the saved html and css and the published render are unchanged; only the form-specific traits go.
- **The survey invite block is the answer where a form was wanted**, and the survey invite page says so in one line.

It is one plugin of the page-builder belt the roadmap's later pruning item weighs; this one goes first because it is the one whose output does not work, not because it is unmaintained.

## Key files

| File                                                             | Role after the change                             |
| ---------------------------------------------------------------- | ------------------------------------------------- |
| `apps/web/app/services/webpageEditor/WebpageEditorPlugins.ts`    | no Forms plugin                                   |
| `apps/web/package.json`                                          | `grapesjs-plugin-forms` removed                   |
| `apps/web/app/components/Resource/SrcdocIframe.vue`              | unchanged: its sandbox is why forms cannot submit |
| `apps/web/content/docs/resource/webpage-survey-invite-blocks.md` | names the invite block as the form replacement    |

## Sources

- [MDN — iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox) — without `allow-forms`, form submission in the frame is blocked.
