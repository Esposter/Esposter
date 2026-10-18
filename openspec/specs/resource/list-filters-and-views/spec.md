## Purpose

The resource list workbench — filter pills, URL-synced state, bulk operations, column management, grouping, CSV export, and real-link rows. The same workbench serves All, Favorites and Recent, and each of those lists differs only by its starting filter and default sort.

## Requirements

### Requirement: Filter pills narrow the list by type, status, date and tag

The resource list SHALL offer filter pills for type, publish status, last-updated date and tag, and SHALL show only the resources that match every active pill.

#### Scenario: Filtering by type shows only the chosen types

- **GIVEN** the owner has sheets and emails
- **WHEN** they choose the Sheet type pill
- **THEN** only sheets are listed

#### Scenario: Filtering by publish status

- **GIVEN** the owner has published and draft resources
- **WHEN** they choose the Published status
- **THEN** only published resources are listed

#### Scenario: Filtering by a relative update date

- **GIVEN** the owner chooses the last 7 days in the Updated pill
- **WHEN** the list loads
- **THEN** only resources updated in the last seven days are listed

#### Scenario: A pill of one choice closes on the pick

- **GIVEN** the Status pill is open
- **WHEN** the owner picks a status
- **THEN** the panel closes

#### Scenario: Removing a pill clears its filter

- **GIVEN** a filter pill is active
- **WHEN** the owner removes it with its close control
- **THEN** the list widens to include what that filter had excluded

#### Scenario: A tag filter with a value matches that value only

- **GIVEN** a resource is tagged with a name and a value
- **WHEN** the owner filters by that tag name and value
- **THEN** the resource is listed
- **AND** resources with the tag name and a different value are not listed

### Requirement: Filter and sort state lives in the address

The list SHALL keep its search, filters, sort, column widths and page in the address, so that a reload or a shared link shows the same list.

#### Scenario: A reload keeps the filtered list

- **GIVEN** the owner has filtered and sorted the list
- **WHEN** they reload the page
- **THEN** the same filters and sort are applied

#### Scenario: A default value is not written to the address

- **GIVEN** the owner has not changed a filter from its default
- **WHEN** they look at the address
- **THEN** that default does not appear in it

#### Scenario: A damaged column width in the address is ignored

- **GIVEN** the address holds a column width for a column that does not exist
- **WHEN** the list loads
- **THEN** that width is dropped and the list loads normally

### Requirement: Typing in a text filter waits for a pause before the list updates

The list SHALL wait for the owner to pause typing before it applies a search or tag text, rather than reloading on every keystroke.

#### Scenario: Typing a search term updates the list once

- **GIVEN** the owner is typing a search term
- **WHEN** they type several characters without pausing
- **THEN** the list does not reload until they pause

### Requirement: Selected resources can be deleted together and restored together

The list SHALL let the owner select rows across pages, delete the whole selection to the recycle bin, and restore the selection from the toast after it.

#### Scenario: Selecting rows shows the selection toolbar

- **GIVEN** the owner selects two rows
- **WHEN** the selection is made
- **THEN** a toolbar shows the count with Delete, Export CSV, Save as blueprint and Clear

#### Scenario: A selection keeps rows chosen on other pages

- **GIVEN** the owner selects a row, then moves to the next page and selects another
- **WHEN** they look at the toolbar
- **THEN** the count includes both rows

#### Scenario: Deleting a selection moves it to the recycle bin

- **GIVEN** the owner has selected several rows
- **WHEN** they choose Delete
- **THEN** every selected resource moves to the recycle bin
- **AND** a toast offers to restore them all

#### Scenario: Restoring from the toast brings the whole selection back

- **GIVEN** a selection was just deleted
- **WHEN** the owner chooses Restore on the toast
- **THEN** every resource in that selection is restored

### Requirement: Columns can be hidden except the name and the sort column

The list SHALL let the owner show or hide columns, and SHALL NOT let them hide the name column or the column the list is sorted by.

#### Scenario: Hiding a column remembers the choice

- **GIVEN** the owner hides the Created column
- **WHEN** they reload the list
- **THEN** the Created column is still hidden

#### Scenario: The name column cannot be hidden

- **GIVEN** the owner opens the column chooser
- **WHEN** they look at the name column
- **THEN** it cannot be unchecked

#### Scenario: Last accessed is shown on the Recent list only by default

- **GIVEN** the owner opens the Recent list
- **WHEN** the list loads
- **THEN** the Last accessed column is shown and cannot be hidden
- **AND** on the All list it is hidden by default

### Requirement: Rows group under their type on request

The list SHALL group the page's rows under a header for each type when the owner turns on group by type, and each group SHALL open and close.

#### Scenario: Grouping shows a header per type with a count

- **GIVEN** the list holds sheets and emails
- **WHEN** the owner turns on group by type
- **THEN** each type has a header showing its icon, title and count

#### Scenario: A group opens and closes

- **GIVEN** group by type is on
- **WHEN** the owner clicks a group's header
- **THEN** that group's rows are hidden, and clicking again shows them

### Requirement: Opening a row is one click and the menu has no Open command

The list SHALL open a resource when its row is clicked or Enter is pressed on it, and its context menu SHALL NOT offer a separate Open command.

#### Scenario: Clicking a row opens the resource

- **GIVEN** the list shows a resource
- **WHEN** the owner clicks its row
- **THEN** the resource page opens

#### Scenario: The context menu offers the other commands

- **GIVEN** the owner right-clicks a row
- **WHEN** the menu opens
- **THEN** it offers Open in new tab, Copy link, Save as blueprint, Rename and Delete
- **AND** it does not offer Open

### Requirement: Export CSV writes the filtered list and says when it is cut short

The list SHALL export the resources matching the current filters, or the selected rows when some are selected, and SHALL warn when the export reached its row limit.

#### Scenario: Exporting writes the filtered rows

- **GIVEN** the owner has filtered the list to sheets
- **WHEN** they choose Export CSV
- **THEN** the file lists only those sheets

#### Scenario: Exporting a selection writes only the selected rows

- **GIVEN** the owner has selected two rows
- **WHEN** they choose Export CSV from the selection toolbar
- **THEN** the file lists only those two rows

#### Scenario: A list longer than the limit warns that the export is cut short

- **GIVEN** the filtered list is longer than the export limit
- **WHEN** the owner exports it
- **THEN** the file holds rows up to the limit
- **AND** a warning says the export was cut short

### Requirement: The list shows clear empty and error states

The list SHALL say why it is empty and SHALL offer a retry when a read fails with no rows to show.

#### Scenario: No matches with filters active offers clearing them

- **GIVEN** filters are active and match nothing
- **WHEN** the list loads
- **THEN** it says no resources match the filters
- **AND** offers to clear the filters

#### Scenario: A failed read offers a retry

- **GIVEN** the list cannot load and has no rows
- **WHEN** the owner sees the list
- **THEN** an error with a Try again action is shown

#### Scenario: A refresh keeps the rows showing

- **GIVEN** the list has rows showing
- **WHEN** a later read runs
- **THEN** the rows stay on screen while the table is marked busy

### Requirement: The footer states the position and total

The list SHALL show the range of rows on the page and the total number matching the filters, with previous and next controls.

#### Scenario: The footer shows the range and total

- **GIVEN** the list holds forty matching resources and shows twenty per page
- **WHEN** the owner views the first page
- **THEN** the footer reads 1 to 20 of 40
