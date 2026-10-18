## 1. Document

- [ ] 1.1 Define the typed tree and its schema, with node ids unique within a document and a node limit. Verify: tests named after the scenarios 'A document with a duplicate node id is refused' and 'A document over the node limit is refused'.
- [ ] 1.2 Define the node-type registry, with each type's fields, slots and allowed child types, shared by the editor and the server. Verify: a test named after the scenario 'A Columns node holds only columns'.

## 2. Node types

- [ ] 2.1 Build the webpage types with their accessible output. Verify: tests named after the scenarios 'An image without alternative text cannot be saved', 'A decorative image publishes marked as decorative', 'A video or map without a title cannot be saved', 'Tabs publish as tabs that move with the arrow keys', 'Typed text stands still for a reader who prefers reduced motion' and 'A countdown does not announce each tick'.
- [ ] 2.2 Link each survey invite's survey as a resource link. Verify: a test named after the scenario 'Deleting a surveyed invite's survey names the webpage'.

## 3. Safe output

- [ ] 3.1 Escape text and attributes, check every URL, and clean custom HTML through the shared sanitiser. Verify: tests named after the scenarios 'A button with a javascript link cannot be saved' and 'Custom HTML is cleaned before it is published'.

## 4. Rendering and publishing

- [ ] 4.1 Render a webpage to one HTML document on publish, and export it as one HTML file. Verify: tests named after the scenarios 'A published webpage is one HTML document' and 'Exporting a webpage downloads one HTML file'.
- [ ] 4.2 Compile an email to its HTML on the server on publish, refusing markup that fails strict validation. Verify: tests named after the scenarios 'An email with invalid markup is refused at publish' and 'A valid email publishes its compiled HTML'.
