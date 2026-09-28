---
title: Todo attachments
description: Deferred — files added to a todo, as To Do's Add a file is; a todo's notes already hold a link, and a file on a todo rides the per-resource asset store the Note's images build first.
---

# Todo Attachments

Microsoft To Do lets a task's detail view **Add a file**, any type, "limited to 25 MB per task", and shows each file in the task ([Add files to your tasks](https://support.microsoft.com/en-us/todo/add-files-to-your-tasks)).

## Why deferred

A file on a todo is a blob the resource owns, counted against its storage and removed with it — the [resource file assets](/docs/resource/resource-file-assets) path, which the Note's [images](/docs/proposals/resource/note-images) are the first content type to write into from inside the content. Building attachments before that path has a content-side writer would design it twice. Meanwhile a todo's notes take a link to wherever the file already lives, which is To Do's own advice for a Microsoft 365 file.

## Revisit when

The Note's images ship, so a todo can store a file the same way, and a reader asks to keep a file with a task.
