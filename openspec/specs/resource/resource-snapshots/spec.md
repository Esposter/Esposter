## Purpose

Channel-addressed copies of a resource's content — published versions, and revisions of the working copy kept 30 days — behind one version history panel with preview, restore and undo.

## Requirements

### Requirement: Every resource keeps two channels of restorable versions

Every resource SHALL keep restorable versions in two channels, published versions and revisions of its working copy, whether or not its type can be published.

#### Scenario: Resource that cannot be published

- **GIVEN** a resource type that cannot be published
- **WHEN** the owner edits and saves it
- **THEN** its earlier states remain restorable as revisions

### Requirement: Publishing creates a published version that is kept

Each publish SHALL create a published version, and a published version SHALL NOT be removed by the retention rules.

#### Scenario: Owner publishes twice

- **GIVEN** a resource has one published version
- **WHEN** the owner publishes it again
- **THEN** the history holds two published versions
- **AND** the first one is still restorable

### Requirement: Revisions are kept for 30 days, at most 100 at a time

Revisions SHALL be kept for 30 days, and at most 100 revisions SHALL be kept at once.

#### Scenario: Revision passes 30 days

- **GIVEN** a revision was taken 31 days ago
- **WHEN** the owner opens version history
- **THEN** that revision is not listed

#### Scenario: More than 100 revisions

- **GIVEN** a resource already has 100 revisions
- **WHEN** a new revision is taken
- **THEN** the oldest revision is removed

### Requirement: Automatic revisions are taken at most once per interval

The working copy SHALL take at most one automatic revision per interval, however often it is saved.

#### Scenario: Saves within one interval

- **GIVEN** a revision was taken a short time ago
- **WHEN** the owner saves several more times within the same interval
- **THEN** no further automatic revision is taken

#### Scenario: First save after the interval

- **GIVEN** the last revision was taken more than one interval ago
- **WHEN** the owner saves
- **THEN** a new revision is taken

### Requirement: A first save takes no revision

A resource's first content save SHALL NOT take a revision, because there is no earlier state to keep.

#### Scenario: Owner creates a resource

- **GIVEN** a resource has never had content
- **WHEN** the owner saves its first content
- **THEN** no revision is taken

### Requirement: A failed automatic revision never fails the save

A save SHALL succeed even when the automatic revision that accompanies it cannot be taken.

#### Scenario: Revision cannot be taken during a save

- **GIVEN** taking an automatic revision is failing
- **WHEN** the owner saves
- **THEN** the save succeeds

### Requirement: A restore keeps the current state so it can be undone

A restore SHALL first keep the current working copy as a revision, so that the restore can be undone, and SHALL NOT proceed if that revision cannot be kept.

#### Scenario: Owner restores a version

- **GIVEN** a resource has a version from earlier
- **WHEN** the owner restores that version
- **THEN** the working copy before the restore is kept as a revision
- **AND** the working copy now matches the restored version

#### Scenario: Revision cannot be kept before a restore

- **GIVEN** the working copy cannot be kept as a revision
- **WHEN** the owner restores a version
- **THEN** the restore does not proceed
- **AND** the working copy is unchanged

### Requirement: A Sheet import keeps the current state first

A Sheet import SHALL keep the current working copy as a revision first, and SHALL be refused if that revision cannot be kept.

#### Scenario: Owner imports a file into a Sheet

- **GIVEN** a Sheet has data
- **WHEN** the owner imports a file into it
- **THEN** the data before the import is kept as a revision

### Requirement: Restoring replaces the draft without changing what is published

Restoring a version SHALL replace the working copy with that version and SHALL NOT change what is published.

#### Scenario: Restore of a published resource

- **GIVEN** a published resource has a restorable earlier version
- **WHEN** the owner restores that version
- **THEN** the working copy matches the restored version
- **AND** the published version is unchanged

### Requirement: A restore is recorded in the activity trail

A restore SHALL be recorded in the resource's activity trail as Restored.

#### Scenario: Owner restores a version

- **GIVEN** the owner restores a version
- **WHEN** the owner opens the resource's activity
- **THEN** a Restored entry is listed

### Requirement: The restore notice offers one undo

The notice after a restore SHALL offer Undo, which brings back the working copy as it was before that restore, and SHALL work only once.

#### Scenario: Owner undoes a restore

- **GIVEN** the owner has just restored a version
- **WHEN** the owner selects Undo in the notice
- **THEN** the working copy returns to how it was before the restore

#### Scenario: Undo used a second time

- **GIVEN** the owner has already used Undo for a restore
- **WHEN** the owner selects Undo again from the same notice
- **THEN** nothing is restored

### Requirement: Live settings keep their current values when a version is restored

Settings a type declares live SHALL keep their current values when a version is restored or previewed.

#### Scenario: Restoring an older version of a closed survey

- **GIVEN** a survey is closed to responses
- **WHEN** the owner restores an older version of the survey taken while it was open
- **THEN** the survey is still closed to responses

### Requirement: Version numbers are never shown to the owner

Version numbers SHALL NOT be shown to the owner, who SHALL choose a version by its time, reason and summary.

#### Scenario: Owner opens version history

- **GIVEN** a resource has several versions
- **WHEN** the owner opens version history
- **THEN** each version is shown with its time, reason and summary

### Requirement: Version history is opened from the page menu

The owner SHALL open version history from the page's overflow menu, where published versions and revisions appear as one timeline with the current version first.

#### Scenario: Owner opens version history from the menu

- **GIVEN** a resource page is open
- **WHEN** the owner chooses Version history from the overflow menu
- **THEN** the history panel opens
- **AND** the current version is listed first

### Requirement: A published version can be previewed but a revision only restored

The owner SHALL be able to preview a published version as the public sees it, and a revision SHALL be restorable but not previewable.

#### Scenario: Previewing a published version

- **GIVEN** a published resource has an earlier published version
- **WHEN** the owner previews that version
- **THEN** it is shown as the public would see it
- **AND** a banner offers Restore this version and Back to current

#### Scenario: Revision has no preview

- **GIVEN** a revision is listed in version history
- **WHEN** the owner selects it
- **THEN** the owner is offered a restore and not a preview

### Requirement: Only the owner sees version history

Version history SHALL be visible only to the resource's owner.

#### Scenario: Another user requests version history

- **GIVEN** a resource belongs to one user
- **WHEN** a different user requests its version history
- **THEN** the request is refused

### Requirement: The Overview shows the published version and whether it has changes

The Overview SHALL show the published version number and whether the working copy has changes since it was published.

#### Scenario: Working copy changed after publishing

- **GIVEN** a resource was published and then edited
- **WHEN** the owner opens the Overview
- **THEN** the published version is shown
- **AND** the Overview says changes are unpublished

### Requirement: Publish numbering restarts after unpublishing

After a resource is unpublished, the next publish SHALL be numbered 1.

#### Scenario: Republishing after unpublish

- **GIVEN** a resource was published three times and then unpublished
- **WHEN** the owner publishes it again
- **THEN** the new published version is numbered 1

### Requirement: A version past its retention cannot be restored

A version whose retention has ended SHALL NOT be restorable and SHALL NOT be listed.

#### Scenario: Restoring an expired revision

- **GIVEN** a revision has passed its 30 days
- **WHEN** the owner tries to restore it
- **THEN** nothing is restored
- **AND** the revision is not found
