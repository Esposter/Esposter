# PDF viewer surface still to build

## Why

The PDF viewer's spec of record and its design describe a sidebar with Outline and Thumbnails tabs, a thumbnail rail, full screen, a watermarked download and rotate left and right items. `apps/web/app/components/Pdf/` holds only `Viewer.vue` and `Thumbnail.vue`, and `Viewer.vue` draws a single Rotate button with no sidebar, full screen or watermark. A spec of record must describe what exists, so these requirements wait here until a build takes them.

## What Changes

- The viewer gains one sidebar, opened and closed from the toolbar, with an Outline tab and a Thumbnails tab, remembering the reader's open or closed choice and tab in the browser, and overlaying the pages at a phone's width.
- The Thumbnails tab lists a card per page that goes to its page and marks the page in view.
- The viewer gains Rotate left and Rotate right in place of the single Rotate button, turning the pages and their thumbnails.
- The viewer gains Full screen, which fills the screen with the whole viewer and reads Exit full screen while on.
- The viewer gains a download with a watermark, asked for its text in a dialog before the file is made.

## Impact

- Affected spec: `openspec/specs/architecture/pdf-viewer/spec.md`, whose requirements listed here are removed in this change and added back by its build.
- Affected code, when built: `apps/web/app/components/Pdf/Viewer.vue` and new components in the same folder, and the `usePdfViewer` calls they make in `packages/vue-pdfjs-headless`.
