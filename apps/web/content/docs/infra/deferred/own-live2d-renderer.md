---
title: Own Live2D renderer
description: A transparent always-on-top window of the plugin's own rendering the character's Live2D model, with lip sync from the clip — deferred while the desktop viewer already on the machine is that window, behind the trigger of its socket falling short.
---

# Own Live2D renderer

**What it was.** The plugin's own desktop window: a transparent, always-on-top, click-through frame holding a PixiJS Live2D engine — the maintained ones take Cubism 2 through 5 models on PixiJS 8 and drive the mouth from an audio buffer — fed the clip the synthesizer already makes, with the Cubism core loaded from Live2D's own CDN at run time, since it is proprietary rather than ours to ship: Live2D's licence is free to develop against, and free to release on for an individual under the small-scale exemption from its SDK Release License, but the core itself is theirs to distribute. It is the shape the open-source companions for coding agents take, each with its renderer, its tray icon and its build.

**Why deferred.** The window exists already. Live2DViewerEX is on the desktop with the person's models loaded, it is transparent and on top and over every app, and its socket takes a bubble, a sound, a motion and an expression and returns a tap — everything the [viewer as the stage](/docs/proposals/infra/viewer-stage) needs and nothing it would build. A renderer of our own is a second surface to keep working as PixiJS, the Cubism SDK and the packaging tool each move under it, against a viewer that someone else keeps working, and the interface's rule is one plugin and nothing that has to be re-implemented when the platform moves.

**Revisit when:** the viewer's socket cannot do something the stage needs — a sound played on the model without its mouth moving, a bubble that cannot hold what a line needs, no event for something the stage must react to — or the plugin runs where the viewer does not, since the viewer runs on Windows and on phones and the plugin runs wherever node does. Either is a fact one probe or one install states, and the proposal that then follows renders in a window what the viewer sink already sends.

**Cheaper interim:** the viewer sink, and where no viewer runs, the reading through the stock player as today.
