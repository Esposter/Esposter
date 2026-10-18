## 1. The audit

- [ ] 1.1 Give every issue and pull request of `GrapesJS/mjml` one verdict, generated into an Upstream section of this design from a verdict map checked to name each exactly once, with each in-scope defect reproduced against the installed plugin first. Verify: the map's count equals the tracker's, and each in-scope defect names the scenario or regression test that will close it.

## 2. The package

- [ ] 2.1 Create the `mjml-blocks` package as the `file-organization` skill's new-package page sets out, depending on `headless-block-editor` and `@esposter/shared`, with `mjml` as a development dependency only. Verify: `pnpm build` in the package succeeds and its bundle size snapshot is written.
- [ ] 2.2 Write the attribute grammar and every type's attribute table, with the props schemas and field descriptors derived from them. Verify: tests named after the scenario 'An attribute value MJML's type refuses', and tests holding every table equal to the installed components' `allowedAttributes` and `defaultAttributes`.
- [ ] 2.3 Write every type's slot and the root's content from MJML's nesting rules. Verify: tests named after the scenarios 'A section accepts only columns and groups' and 'A text at the root is refused', and a test holding every slot equal to `mjml-preset-core`'s `dependencies`.
- [ ] 2.4 Write the three content kinds and the image's alternative text. Verify: tests named after the scenarios 'Raw HTML is cleaned before it is stored', 'An image without alternative text is refused' and 'A decorative image renders an empty alternative text'.
- [ ] 2.5 Write the attribute cascade. Verify: tests named after the scenarios 'An unset attribute resolves through the cascade' and 'A set attribute wins over the cascade'.
- [ ] 2.6 Write the render to MJML's JSON form and its serialiser. Verify: tests named after the scenarios 'An attribute holding a quote is escaped once' and 'A valid email compiles under strict validation', and a regression test named for each in-scope escaping and output defect of the audit.
- [ ] 2.7 Write the read back from MJML source. Verify: tests named after the scenarios 'Rendering a parsed email returns its source' and 'An import holding a tag the package leaves out is refused'.
- [ ] 2.8 Keep the package's vitest configuration on Node with no DOM environment. Verify: the scenario 'Rendering where there is no document object model' is a test of the package's suite and passes there.

## 3. The record

- [ ] 3.1 Write the package's area as built, with the Upstream table in its `README.md`, and archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/workspace/duplicateProse.test.ts src/services/openspec` passes.
