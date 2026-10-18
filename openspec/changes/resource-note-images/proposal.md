# Note Images

## Why

A note holds text, lists and links, and nothing else. An image is the first block a document reaches for that is not text, such as a screenshot in a spec or a diagram in meeting notes. Every other publishable resource that holds pictures already stores them through the file-assets capability, so the note is the one publishable document type without them.

## What Changes

A note can hold images, added from its menu, by paste or by drop, and each image can carry alt text.

- The note declares file assets, so its images are uploaded and published like any other type's.
- An Image button opens a file picker, and pasting or dropping an image file adds it to the note. The image is stored as a stable resource address, never as inline data.
- Alt text is set from a popover on the selected image.
- A published note shows only images from its own resource storage. An image from any other address is dropped from the published page.
- An image renders at its natural size, capped at the column width.
- **Capabilities:** `resource/note-images` (new).

## Capabilities

- **resource/note-images** (new)

## Waiting on

None.

## Impact

- The note's resource definition, which gains file assets.
- The note's editor, its menu bar and its published view, which passes the sanitiser a note-only allowance for images from resource storage.
- The shared sanitiser's allowance, which stays out of the message composer.
- The rich-text typography, which caps an image at the column width.
- The storage quota, which already charges an uploaded file, and unpublishing, which already sweeps a publication's asset copies. Neither changes.

Size kept as the source page's own: splitting it is a later decision.
