# Video Poster and Autoplay

The poster image a webpage video shows before it plays, and an autoplay setting. It covers the webpage row "Video source, title, controls, poster and autoplay". The source and the title are built and the controls are always on, so the poster and the autoplay are the parts absent. The reference product's video block offers each as a trait.

## Why deferred

A poster is an image, and the program design makes an uploaded file the way an image reaches a page, with external hosts left to an allowlist ([page builder program](../../../changes/archive/2026-11-05-resource-page-builder-program/design.md)). A typed poster address would skip that. The webpage has no video upload yet, so a poster could only be a typed address today. Autoplay starts a motion the reader did not ask for, and no spec settles that choice.

**Revisit when:** webpage video upload ships, so a poster is an uploaded image, and an autoplay rule for motion is written into a spec.
