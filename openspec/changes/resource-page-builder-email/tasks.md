## 1. Design canvas

- [ ] 1.1 Draw sections, columns and leaves on the design canvas, stacking columns below 480 pixels, each leaf with the attributes the MJML blocks' cascade resolves. Verify: tests named after the scenarios 'Columns stack below the mobile breakpoint' and 'A new text shows the default font and padding'.

## 2. Preview

- [ ] 2.1 Show the open document, compiled by the server, in a frame at desktop and mobile width, with the validator's messages above it. Verify: tests named after the scenarios 'Preview shows the compiled email at mobile width' and 'Validator messages show above the preview'.

## 3. Fields

- [ ] 3.1 Bind the preview text to the root's field, so every change updates the compiled email. Verify: a test named after the scenario 'Editing the preview text updates the compiled email'.
- [ ] 3.2 Insert merge fields by typing two braces or by dragging a column into a text. Verify: tests named after the scenarios 'Typing two braces offers the dataset's columns' and 'Dragging a column into a text inserts a merge field'.
- [ ] 3.3 Give email nodes their attribute fields from the MJML blocks' field descriptors, drawn by the style panel's field components, each unset field showing the cascade's value, with no breakpoints or states. Verify: tests named after the scenarios 'An email text has no breakpoint or state choice' and 'Clearing a field restores the root's default'.

## 4. Import

- [ ] 4.1 Import MJML source through the MJML blocks' read back, replacing the document as one history entry, or naming what did not fit. Verify: tests named after the scenarios 'Importing MJML replaces the email' and 'An import that does not fit leaves the email as it was'.
