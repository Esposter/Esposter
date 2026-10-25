## 1. Design canvas

- [ ] 1.1 Draw sections, columns and leaves on the design canvas, stacking columns below 480 pixels, each leaf with the attributes the MJML blocks' cascade resolves. Verify: tests named after the scenarios 'columns stack below the mobile breakpoint' and 'a new text shows the default font and padding'.
  - Done: sections, columns and text leaves draw the cascade's attributes, and the stacking is tested. Open: the leaves still labelled with their type (button, image, divider, spacer, table, social, navbar, carousel, accordion, raw, hero) show their type and padding only, not the attributes the cascade resolves (design item 1).

## 2. Preview

- [ ] 2.1 Show the open document, compiled by the server, in a frame at desktop and mobile width, with the validator's messages above it. Verify: tests named after the scenarios 'preview shows the compiled email at mobile width' and 'validator messages show above the preview' in `apps/web/app/components/PageBuilder/Email/Preview.test.ts`.
  - Done: the component and its tests. Open: the editor shell does not mount it, so no owner can reach it yet (design item 2).

## 3. Fields

- [x] 3.1 Bind the preview text to the root's field, so every change updates the compiled email. Verify: a test named after the scenario 'Editing the preview text updates the compiled email'.
- [ ] 3.2 Insert merge fields by typing two braces or by dragging a column into a text. Verify: tests named after the scenarios 'typing two braces offers the dataset's columns' and 'dragging a column into a text inserts a merge field'.
- [ ] 3.3 Give email nodes their attribute fields from the MJML blocks' field descriptors, drawn by the style panel's field components, each unset field showing the cascade's value, with no breakpoints or states. Verify: tests named after the scenarios 'an email text has no breakpoint or state choice' and 'clearing a field restores the root's default'.
  - Done: each email node's fields come from `getMjmlAttributeFields`, each showing the cascade's value as its placeholder, with no breakpoint or state choice. Open: every field is a plain `UiTextField` in `PageBuilder/Email/StylePanel.vue`. The enum, colour and boolean controls are not built, and the webpage `StylePanel/Field.vue` is not used (design item 3).

## 4. Import

- [x] 4.1 Import MJML source through the MJML blocks' read back, replacing the document as one history entry, or naming what did not fit. Verify: tests named after the scenarios 'Importing MJML replaces the email' and 'An import that does not fit leaves the email as it was'.
