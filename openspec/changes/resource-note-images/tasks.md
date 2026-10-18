## 1. Storage

- [ ] 1.1 Declare the note as holding file assets, so it gains the upload and file delete procedures. Verify: a test named after the scenario 'Choosing an image from the menu adds it to the note'.

## 2. Insertion

- [ ] 2.1 Add the Image button, paste and drop, each uploading through the shared upload path. Verify: tests named after the scenarios 'Choosing an image from the menu adds it to the note', 'Pasting an image adds it to the note' and 'Dropping an image file onto the note adds it'.
- [ ] 2.2 Refuse an image that the owner's storage quota cannot hold. Verify: a test named after the scenario 'An image over the storage quota is refused'.
- [ ] 2.3 Store each added image at a stable resource address, shared by the editor, the render and the validator. Verify: a test named after the scenario 'An added image still shows after the note is saved and reopened'.

## 3. Alt text

- [ ] 3.1 Add the alt text popover on a selected image. Verify: a test named after the scenario 'Setting alt text from the image popover'.

## 4. Published view and layout

- [ ] 4.1 Allow an image in the published note only from a resource asset address, keeping its alt and title. Verify: tests named after the scenarios 'A published note shows its own image' and 'A published note drops an image from another site'.
- [ ] 4.2 Cap an image at the column width in the rich-text typography. Verify: a test named after the scenario 'A wide image is capped at the column width'.
