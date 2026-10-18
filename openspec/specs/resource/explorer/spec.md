## Purpose

The single Azure-portal-like UI for every resource — Home, list, marketplace create flow, and a resource page composing capability-aware blades. Every resource type reaches the same explorer, and a type's capabilities decide only which blades and commands it shows.

## Requirements

### Requirement: Home offers search, quick-create and the recent and favourite resources

The explorer home page SHALL offer a search field, quick-create tiles for each resource type, a Create a resource action, and Recent and Favorites tabs with a See all link.

#### Scenario: Home shows the entry points in order

- **GIVEN** the owner opens the Resource Explorer
- **WHEN** the home page loads
- **THEN** it shows search, then the quick-create tiles, then the Recent and Favorites tabs

#### Scenario: A quick-create tile opens that type's create form

- **GIVEN** the owner is on Home
- **WHEN** they choose the Sheet tile
- **THEN** the create form for a sheet opens

#### Scenario: A recent card opens in a new tab from its menu

- **GIVEN** a resource is shown under Recent
- **WHEN** the owner chooses Open in new tab from its menu
- **THEN** the resource opens in a new browser tab

#### Scenario: A failed Recent read shows its own retry

- **GIVEN** the Recent read fails
- **WHEN** the owner sees the tab
- **THEN** an error is shown with a retry action

### Requirement: The All list is the workbench over every resource

The All list SHALL show every resource the owner has, with the type, name and created and updated dates, and a row SHALL open its resource.

#### Scenario: All lists resources of every type

- **GIVEN** the owner has resources of several types
- **WHEN** they open All
- **THEN** every type is listed

#### Scenario: Search and filters from Home land on the filtered list

- **GIVEN** the owner searches on Home and picks See all
- **WHEN** All opens
- **THEN** the list is already filtered by that search

#### Scenario: Close returns to Home

- **GIVEN** the owner is on All
- **WHEN** they choose the close control
- **THEN** they return to Home

### Requirement: Creating a resource picks a type, then names it

The explorer SHALL create a resource by first choosing its type on a gallery page and then entering its name on that type's form, and SHALL open the new resource's Overview.

#### Scenario: Creating a resource from the gallery

- **GIVEN** the owner opens the create gallery
- **WHEN** they choose a type and enter a name
- **THEN** the new resource opens on its Overview

#### Scenario: A name is required to create

- **GIVEN** the owner is on a type's create form
- **WHEN** they try to create with no name
- **THEN** creation is refused and the form asks for a name

### Requirement: The resource page shows its blades under the title

The resource page SHALL show a trail, the resource's title and type, and its blades as tabs, with the blades chosen by the resource's type.

#### Scenario: A sheet's blades

- **GIVEN** the owner opens a sheet
- **WHEN** the page loads
- **THEN** the tabs are Overview, Activity, Data and Settings

#### Scenario: A program has no Editor blade

- **GIVEN** the owner opens a program
- **WHEN** the page loads
- **THEN** no Editor tab is shown

#### Scenario: Publish history appears only for publishable types

- **GIVEN** the owner opens a resource that cannot be published
- **WHEN** the page loads
- **THEN** no Publish history tab is shown

#### Scenario: An unknown resource shows not found

- **GIVEN** the address names a resource that does not exist
- **WHEN** the page loads
- **THEN** a not-found page is shown

#### Scenario: An unknown blade is not found

- **GIVEN** the address names a blade the resource's type does not have
- **WHEN** the page loads
- **THEN** a not-found page is shown

### Requirement: One primary action is shown and the rest sit in the overflow menu

The resource page SHALL show a single primary action for the resource, such as Publish or Share, and SHALL place its other commands in the overflow menu.

#### Scenario: A publishable resource shows Publish or Share

- **GIVEN** the owner opens a publishable resource
- **WHEN** the page loads
- **THEN** the primary action is Publish or Share
- **AND** Rename, Duplicate, Version history and Delete are in the overflow menu

#### Scenario: A resource that cannot be published shows no publish command

- **GIVEN** the owner opens a resource that cannot be published
- **WHEN** they look at the commands
- **THEN** no Publish, Unpublish or Share command is offered

### Requirement: Import and export commands follow the resource's formats

The resource page SHALL offer an Import command and an Export command for each file format a portable resource supports.

#### Scenario: A sheet offers CSV and other formats

- **GIVEN** the owner opens a sheet
- **WHEN** they look at the commands
- **THEN** an Import and an Export command are offered for each supported format

### Requirement: The close control goes back to where the visitor came from

The resource page's close control SHALL return the visitor to the page they came through, or to Home when they arrived directly.

#### Scenario: Closing after drilling in from All returns to All

- **GIVEN** the owner opened a resource from All
- **WHEN** they choose close
- **THEN** they return to All

#### Scenario: Closing after a direct arrival returns to Home

- **GIVEN** the owner opened a resource from a shared link
- **WHEN** they choose close
- **THEN** they return to Home

### Requirement: A resource's content is written only when it is first saved

The system SHALL create a resource without any content and SHALL write its content only on the first save from an editor.

#### Scenario: A new resource has no content until it is edited

- **GIVEN** the owner has just created a resource
- **WHEN** they open its Overview
- **THEN** the resource has no saved content yet

#### Scenario: The first edit saves content

- **GIVEN** the owner makes a change in an editor
- **WHEN** it saves
- **THEN** the resource has saved content

### Requirement: A save over a newer version is refused

The system SHALL refuse a save made from an older copy of a resource's content, and SHALL NOT overwrite the newer version.

#### Scenario: A stale save is refused

- **GIVEN** the owner has a resource open and it was changed elsewhere since it loaded
- **WHEN** this copy is saved
- **THEN** the save is refused
- **AND** the owner is told the content changed

### Requirement: Deleting a resource is undoable until it is purged

The system SHALL move a deleted resource to the recycle bin where it can be restored, and SHALL remove it for good only when it is purged.

#### Scenario: A deleted resource can be restored

- **GIVEN** the owner deletes a resource
- **WHEN** they restore it from the recycle bin
- **THEN** the resource comes back with its content

#### Scenario: A purged resource is gone

- **GIVEN** a resource in the recycle bin is purged
- **WHEN** the owner looks for it
- **THEN** it is not found

### Requirement: A published resource is readable at its public address only while published

The system SHALL show a published resource at its public view address, and SHALL NOT show an unpublished resource there.

#### Scenario: A published resource is viewable without signing in

- **GIVEN** a resource is published
- **WHEN** anyone opens its public view address
- **THEN** the published copy is shown without signing in

#### Scenario: An unpublished resource is not viewable

- **GIVEN** a resource was unpublished
- **WHEN** anyone opens its public view address
- **THEN** the page is not shown

### Requirement: The explorer requires a signed-in owner

The explorer SHALL show its pages only to a signed-in owner, and SHALL leave public view pages open to anyone.

#### Scenario: A signed-out visitor is asked to sign in

- **GIVEN** a visitor is not signed in
- **WHEN** they open an explorer page
- **THEN** they are asked to sign in

#### Scenario: A public view needs no sign-in

- **GIVEN** a visitor is not signed in
- **WHEN** they open a published resource's view address
- **THEN** the view is shown

### Requirement: The Overview shows publish status only for publishable types

The Overview blade SHALL show the publish status and public link only for resources that can be published.

#### Scenario: A publishable resource shows its status and link

- **GIVEN** the owner opens a publishable resource's Overview
- **WHEN** the page loads
- **THEN** its publish status, version and public link are shown

#### Scenario: A non-publishable resource shows no status row

- **GIVEN** the owner opens a sheet's Overview
- **WHEN** the page loads
- **THEN** no publish status row is shown

### Requirement: A reference to a deleted resource is not cascaded to its consumers

The system SHALL leave a consumer's stored reference in place when its source is deleted, and SHALL show the consumer that its source is missing.

#### Scenario: A dashboard keeps its binding when its sheet is deleted

- **GIVEN** a dashboard's visual is bound to a sheet
- **WHEN** the sheet is deleted
- **THEN** the dashboard keeps the binding
- **AND** shows that the source is missing
