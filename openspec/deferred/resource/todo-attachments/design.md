# Todo Attachments

Microsoft To Do lets a task's detail view **Add a file**, any type, "limited to 25 MB per task", and shows each file in the task ([Add files to your tasks](https://support.microsoft.com/en-us/todo/add-files-to-your-tasks)).

## Why deferred

A file on a todo is a blob the resource owns, counted against its storage and removed with it — the [resource file assets](../../../specs/resource/resource-file-assets/design.md) path, which the Note's [images](../../../changes/resource-note-images/design.md) are the first content type to write into from inside the content. Building attachments before that path has a content-side writer would design it twice. Meanwhile a todo's notes take a link to wherever the file already lives, which is To Do's own advice for a Microsoft 365 file.

## Revisit when

The Note's images ship, so a todo can store a file the same way, and a reader asks to keep a file with a task.
