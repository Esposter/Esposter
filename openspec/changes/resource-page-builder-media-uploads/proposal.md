## Why

A webpage image takes only a typed address, so an owner cannot put a picture they hold on a page. A webpage video has no upload at all. The email's image field uploads but cannot choose an image the email already holds, so an image used twice is uploaded twice. The archived page builder design promised upload first for both webpage media and the document's own images beside the email field, and none of it is built.

## What Changes

- A webpage image's field offers an upload first, and keeps its address field below it.
- A webpage video takes an upload, within the upload's size limit.
- A picker lists the files the webpage or the email already holds, filtered to images or to videos, and choosing one sets the source.
- A file that is not an image is refused before an image upload starts.

## Capabilities

### Modified Capabilities

- `resource/page-builder/document-model`: a webpage image and video take an uploaded source.
- `resource/resource-file-assets`: an owner lists the files a resource holds, filtered to a kind.
- `resource/page-builder/email`: the email's image field lists the images the email already holds.

## Impact

Webpage media gain the upload round-trip the email and the note already use. The listing reads the resource's own files directory, owner-only. No upload path is added beside the existing one.
