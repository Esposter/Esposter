## 1. Types

- [ ] 1.1 Define the email node types and their slot rules, with a section holding only columns. Verify: a test named after the scenario 'A section accepts only columns'.
- [ ] 1.2 Require alternative text on an email image before it can be saved. Verify: a test named after the scenario 'An image without alternative text is refused'.
- [ ] 1.3 Give each email type the engine's default attributes as its schema defaults, and test them against the installed engine's defaults. Verify: a test named after the scenario 'A new text shows the default font and padding'.

## 2. Design canvas

- [ ] 2.1 Draw sections, columns and leaves on the design canvas, stacking columns below 480 pixels. Verify: a test named after the scenario 'Columns stack below the mobile breakpoint'.

## 3. Preview

- [ ] 3.1 Show the compiled email in a frame at desktop and mobile width, with the validator's messages above it. Verify: tests named after the scenarios 'Preview shows the compiled email at mobile width' and 'Validator messages show above the preview'.

## 4. Fields

- [ ] 4.1 Bind the preview text to the root's field, so every change updates the compiled email. Verify: a test named after the scenario 'Editing the preview text updates the compiled email'.
- [ ] 4.2 Insert merge fields by typing two braces or by dragging a column into a text. Verify: tests named after the scenarios 'Typing two braces offers the dataset's columns' and 'Dragging a column into a text inserts a merge field'.
- [ ] 4.3 Give email nodes their attribute fields, drawn by the style panel's field components, with no breakpoints or states. Verify: a test named after the scenario 'An email text has no breakpoint or state choice'.

## 5. Export

- [ ] 5.1 Make the personalised export read the compiled email, so it runs with no editor open. Verify: a test named after the scenario 'A personalised export runs with the editor closed'.
