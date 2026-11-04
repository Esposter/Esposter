## 1. Sidebar and thumbnails

- [ ] 1.1 Write the sidebar's scenarios first and see them fail: the outline and thumbnails tabs, the open-by-width default, and the remembered choice. Verify: `pnpm test app/components/Pdf --run` from `apps/web` reports them failing.
- [ ] 1.2 Build the sidebar with its two tabs, the outline entry navigation and the thumbnail cards that go to and mark their page. Verify: the same command passes.
- [ ] 1.3 Build the phone-width overlay of the sidebar over the pages. Verify: the same command passes.

## 2. Rotation and full screen

- [ ] 2.1 Replace the single Rotate button with Rotate left and Rotate right, turning the pages and their thumbnails, with four quarter turns returning them upright. Verify: `pnpm test app/components/Pdf --run` from `apps/web` passes.
- [ ] 2.2 Add the Full screen item that reads Exit full screen while on, and leaves on Escape. Verify: the same command passes.

## 3. Watermarked download

- [ ] 3.1 Add the download with watermark: a dialog asking the text, its action disabled while empty, and a file under the attachment's name with the text on every page. Verify: the same command passes.
