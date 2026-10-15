---
title: Spoilers
description: Text and attachment spoilers — marked content stays hidden until a reader reveals it.
---

# Spoilers

Text between `||` markers, text submitted through `/spoiler`, and marked image or video attachments are hidden until a reader reveals them. Revealing is local to that message and reader; it does not change stored message content.

## Text

The composer turns `||text||` into a Tiptap spoiler mark as the closing bars are typed. **Ctrl+Shift+S** toggles the mark on the selection. `/spoiler <text>` submits text already wrapped in the spoiler mark. The rendered `data-spoiler` span is a focusable button; click, Enter, or Space toggles its reveal state.

The HTML sanitizer preserves the mark attribute. Push notification text replaces spoiler content with blocks, while message search continues to match the original text. Link previews are not made for URLs inside a spoiler.

## Attachments

The composer marks an attachment as a spoiler when its filename starts with `SPOILER_`. The eye button on the attachment preview can toggle the mark. A marked image or video is blurred behind a **SPOILER** label; its first activation reveals it and its next activation opens the viewer.

`FileEntity.isSpoiler` is persisted with the message. Older attachment rows without the field read as `false`, so they remain visible as before. The composer has no text-formatting toolbar, so there is no toolbar button for the text mark.

## Key files

| File                                                                      | Role                                             |
| ------------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/web/app/composables/message/spoiler/useSpoilerExtension.ts`         | Tiptap mark, input rule and keyboard shortcut    |
| `apps/web/app/composables/message/slashCommand/useExecuteSlashCommand.ts` | `/spoiler` text wrapper                          |
| `apps/web/app/store/message/input/uploadFile.ts`                          | filename detection and pending attachment toggle |
| `apps/web/app/components/Message/Model/Message/File/Index.vue`            | blurred spoiler tile and first-activation reveal |
| `packages/db-schema/src/models/azure/table/FileEntity.ts`                 | persisted flag and legacy default                |
