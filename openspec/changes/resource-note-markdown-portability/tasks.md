## 1. Converter

- [ ] 1.1 Admit the Markdown converter through dependency admission, then add it pinned to an exact version. Verify: a test named after the scenario 'A note with every block survives a Markdown round trip' passes on the pinned version.

## 2. Export

- [ ] 2.1 Serialize the note to Markdown and download it under the note's name. Verify: a test named after the scenario 'Exporting a note downloads a Markdown file'.

## 3. Import

- [ ] 3.1 Parse an imported file against the note's own content extensions, so the note decides what round-trips. Verify: a test named after the scenario 'A note with every block survives a Markdown round trip'.
- [ ] 3.2 Show the import preview with confirm and cancel, saving only on confirm. Verify: tests named after the scenarios 'An import previews the content it will replace' and 'Cancelling an import keeps the note as it was'.

## 4. Menu and history

- [ ] 4.1 Add the two commands to the note's overflow menu. Verify: a test named after the scenario 'The overflow menu lists the Markdown commands'.
- [ ] 4.2 Save a confirmed import through the note's content save, so the replaced content stays in history. Verify: a test named after the scenario 'An imported note keeps its previous content in history'.
