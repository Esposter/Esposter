## Purpose

Azure's commands on the resource page — one action shown and the rest in the page's overflow menu, Refresh, Duplicate, a delete the Recycle bin undoes, and a save-conflict surface.

## Requirements

### Requirement: One action is shown beside the title

The resource page SHALL show one primary action beside the title, and the remaining commands SHALL be in its overflow menu.

#### Scenario: Publishable resource that is not yet published

- **GIVEN** a publishable resource has no publication
- **WHEN** the owner views its page
- **THEN** Publish is the one action shown
- **AND** the other commands are in the overflow menu

#### Scenario: Resource type that cannot be published

- **GIVEN** a resource type that cannot be published
- **WHEN** the owner views its page
- **THEN** no primary action is shown beside the title

### Requirement: The favourite and close controls stay visible

The favourite and close controls SHALL stay visible beside the title at every width.

#### Scenario: Narrow window

- **GIVEN** the window is narrow
- **WHEN** the owner views a resource page
- **THEN** the favourite and close controls are still visible

### Requirement: The overflow menu opens from several gestures

The overflow menu SHALL open from its button, from a right-click, from a long press, and from the menu key over the title.

#### Scenario: Right-click on the title

- **GIVEN** a resource page is open
- **WHEN** the owner right-clicks the title
- **THEN** the overflow menu opens

### Requirement: A command already running is disabled, not hidden

A command that is already under way SHALL be disabled in the overflow menu rather than removed from it.

#### Scenario: Refresh while refreshing

- **GIVEN** a refresh is in progress
- **WHEN** the owner opens the overflow menu
- **THEN** Refresh is shown disabled

### Requirement: Refresh reloads the resource from the server

Refresh SHALL reload the resource's details and publication state from the server.

#### Scenario: Owner refreshes the page

- **GIVEN** the resource changed on the server
- **WHEN** the owner chooses Refresh
- **THEN** the page shows the latest details and publication state

### Requirement: Duplicate creates an unpublished copy

Duplicate SHALL create a copy named with the suffix copy, as a draft with no publication, and SHALL open the copy.

#### Scenario: Owner duplicates a published resource

- **GIVEN** a published resource
- **WHEN** the owner chooses Duplicate
- **THEN** a new resource named with the suffix copy is created as a draft
- **AND** the owner is taken to the copy's Overview

### Requirement: Delete asks first and offers Restore

Delete SHALL ask the owner to confirm, move the resource to the recycle bin, and offer a single Restore action in the notice.

#### Scenario: Owner confirms delete then restores

- **GIVEN** a resource page is open
- **WHEN** the owner chooses Delete and confirms
- **THEN** the resource is moved to the recycle bin
- **AND** a notice offers Restore
- **AND** choosing Restore brings the resource back

#### Scenario: Owner cancels delete

- **GIVEN** a resource page is open
- **WHEN** the owner chooses Delete and cancels the confirmation
- **THEN** the resource is kept

### Requirement: Deleting a resource does not require typing its name

Deleting a resource SHALL NOT require typing its name, because the recycle bin makes the delete reversible.

#### Scenario: Delete confirmation

- **GIVEN** a resource page is open
- **WHEN** the owner chooses Delete
- **THEN** the confirmation asks a plain yes or no question

### Requirement: A save refused as out of date tells the owner to refresh

When a save is refused because the resource was modified elsewhere, the owner SHALL be told the resource was modified elsewhere and offered a refresh that reloads the latest version.

#### Scenario: Save from a stale tab

- **GIVEN** the same resource is open in two tabs
- **AND** one tab saved a newer version
- **WHEN** the other tab saves its older version
- **THEN** that tab shows a warning that the resource was modified elsewhere
- **AND** the warning offers a Refresh action that loads the latest version
