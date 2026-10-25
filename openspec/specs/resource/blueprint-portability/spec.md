# resource/blueprint-portability Specification

## Purpose

A blueprint's manifest leaves the app as a JSON file and comes back in. Export downloads the saved manifest, so the file is what a deploy would create. An import fills the Editor with the file's manifest as unsaved text, and only Save makes it the saved one.

## Requirements

### Requirement: A blueprint exports its saved manifest as a JSON file

A blueprint SHALL offer an export that downloads its saved manifest as a JSON file, and the export SHALL NOT include text the owner has not saved.

#### Scenario: Exporting downloads the saved manifest

- **GIVEN** a blueprint with a saved manifest
- **WHEN** the owner chooses Export from the resource's menu
- **THEN** a JSON file of that manifest is downloaded

#### Scenario: Unsaved editor text is not exported

- **GIVEN** the Editor holds manifest text the owner has not saved
- **WHEN** the owner chooses Export
- **THEN** the downloaded file holds the saved manifest, not the text on screen

### Requirement: A manifest file is imported into the editor as unsaved text

A blueprint SHALL accept an import of a JSON manifest file, which fills the Editor with that manifest as unsaved text, and an import SHALL change nothing when the file is refused.

#### Scenario: Importing a manifest fills the editor unsaved

- **GIVEN** a blueprint open in the Editor
- **WHEN** the owner imports a valid manifest file
- **THEN** the Editor shows the manifest as unsaved text
- **AND** the saved manifest is unchanged

#### Scenario: An invalid manifest file is refused and changes nothing

- **GIVEN** a blueprint open in the Editor
- **WHEN** the owner imports a file the manifest schema rejects
- **THEN** the import is refused with a notification
- **AND** the Editor's text is unchanged

#### Scenario: A manifest file over the limit is refused before it is read

- **GIVEN** a file larger than the app's file limit
- **WHEN** the owner imports it as a manifest
- **THEN** the file is refused before its contents are read

### Requirement: An imported manifest takes effect only when it is saved

An imported manifest SHALL become the blueprint's saved manifest only through Save, and Deploy SHALL stay disabled until the manifest on screen is saved.

#### Scenario: Saving an imported manifest keeps the previous one in version history

- **GIVEN** an imported manifest the owner has not saved
- **WHEN** the owner saves it
- **THEN** the manifest it replaces remains in the blueprint's version history

#### Scenario: Deploy stays disabled until an imported manifest is saved

- **GIVEN** an imported manifest the owner has not saved
- **WHEN** the owner looks at the Deploy command
- **THEN** Deploy is disabled

### Requirement: A manifest survives an export and an import unchanged

A manifest exported and imported again SHALL be the same manifest.

#### Scenario: A manifest exported and imported again is unchanged

- **GIVEN** a blueprint with a saved manifest
- **WHEN** the owner exports it and imports the file into the same blueprint
- **THEN** the manifest on screen equals the saved manifest
