## 1. Portable entry

- [ ] 1.1 Declare the blueprint `portable` in the resource definition map, and add its format to the Portable format map so the compile error for a missing entry is cleared. Verify: a test named after the scenario 'Exporting downloads the saved manifest' fails before the entry exists, then passes.

## 2. Export

- [ ] 2.1 Export the saved manifest as `<name>.json`, reading the saved copy rather than the Editor's text. Verify: tests named after the scenarios 'Exporting downloads the saved manifest' and 'Unsaved editor text is not exported'.

## 3. Import

- [ ] 3.1 Import a manifest file into the blueprint store's working manifest, shown unsaved in the Editor. Verify: a test named after the scenario 'Importing a manifest fills the editor unsaved'.
- [ ] 3.2 Refuse a file the manifest schema rejects, and a file over the file limit before it is read, changing nothing. Verify: tests named after the scenarios 'An invalid manifest file is refused and changes nothing' and 'A manifest file over the limit is refused before it is read'.
- [ ] 3.3 Save commits an imported manifest and keeps the one it replaces in version history, and Deploy stays disabled until then. Verify: tests named after the scenarios 'Saving an imported manifest keeps the previous one in version history' and 'Deploy stays disabled until an imported manifest is saved'.

## 4. Round trip

- [ ] 4.1 Export a captured blueprint and import the file into the same blueprint, comparing the manifest on screen to the saved one. Verify: a test named after the scenario 'A manifest exported and imported again is unchanged'.
