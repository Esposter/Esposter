## 1. Document

- [ ] 1.1 Define the webpage and email documents beside `WebpageEditor` and `EmailEditor`, each schema the core's over its registry with a named node limit. Verify: tests named after the scenarios 'A document with a duplicate node id is refused' and 'A document over the node limit is refused'.
- [ ] 1.2 Define the two node-type registries, with each type's fields, slots and allowed child types, shared by the editor and the server. Verify: a test named after the scenario 'A Columns node holds only columns'.
- [ ] 1.3 Keep each open document in the page builder's document store, keyed by its resource, loaded and saved through functions its caller passes, touching nothing GrapesJS reads. Verify: a test named after the scenario 'Two open webpages keep their own documents'.

## 2. Node types

- [ ] 2.1 Build the webpage types with their accessible output, declaring the survey invite's survey prop through `createResourceLinkSchema`. Verify: tests named after the scenarios 'An image without alternative text cannot be saved', 'A decorative image publishes marked as decorative', 'A video or map without a title cannot be saved', 'Tabs publish as tabs that move with the arrow keys', 'Typed text stands still for a reader who prefers reduced motion' and 'A countdown does not announce each tick'.

## 3. Safe output

- [ ] 3.1 Escape text and attributes, check every URL, and clean custom HTML through the shared sanitiser. Verify: tests named after the scenarios 'A button with a javascript link cannot be saved' and 'Custom HTML is cleaned before it is published'.

## 4. Rendering

- [ ] 4.1 Render a webpage document to one HTML document, as a pure function the browser can also run. Verify: a test named after the scenario 'A webpage document renders as one HTML document'.
- [ ] 4.2 Compile an email document on the server with MJML's Node package, refusing markup that fails strict validation. Verify: tests named after the scenarios 'An email document with invalid markup is refused by the compile' and 'A valid email document compiles to email HTML'.

## 5. The record

- [ ] 5.1 Describe the two documents, their registries and the renderers as built, then archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/services/openspec` passes.
