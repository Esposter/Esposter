# Tasks

## 1. The webpage image

- [ ] 1.1 Offer the upload first in the webpage image's field, keeping the address field below it, and set the source to the uploaded file's address. Verify: tests named after the scenarios 'Uploading an image sets the image source' and 'A failed upload leaves the image unchanged' written first and seen failing.
- [ ] 1.2 Refuse a file that is not an image before the upload starts, keeping the source. Verify: a test named after the scenario 'A file that is not an image is refused before upload' written first and seen failing.

## 2. The webpage video

- [ ] 2.1 Add the two video types and offer the upload on the video's field, setting the source to the uploaded file's address. Verify: a test named after the scenario 'Uploading a video sets the video source' written first and seen failing.
- [ ] 2.2 Refuse a video over the upload size limit with the limit shown, keeping the source. Verify: a test named after the scenario 'A video over the upload size limit is refused' written first and seen failing.

## 3. The listing

- [ ] 3.1 Add the owner's listing of the files a resource holds, filtered to the kind a field takes, and refused for a resource the owner does not hold. Verify: tests named after the scenarios 'The picker lists the files the resource holds', 'A video picker lists videos alone' and 'A resource the owner does not hold lists no files' written first and seen failing.
- [ ] 3.2 Draw the picker beside the webpage's image and video fields and set the source from a chosen file. Verify: tests named after the scenarios 'Choosing a listed video sets the video source' and 'Choosing a listed image sets the image source' written first and seen failing.

## 4. The email picker

- [ ] 4.1 Draw the picker beside the email's image upload over the email's own files, setting the picked node's source from a chosen image. Verify: tests named after the scenarios 'The email picker lists the images the email already holds' and 'Choosing a listed email image sets the picked node source' written first and seen failing.

## 5. The record

- [ ] 5.1 Update the document model design's webpage node types, the file assets design's adopters and Not built, and the email design's image field. Verify: `pnpm exec openspec validate resource-page-builder-media-uploads --strict --no-interactive` passes.
