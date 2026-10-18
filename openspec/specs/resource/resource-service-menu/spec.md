## Purpose

Home's hamburger drawer for the resource area — All, Favorites, Recent, Tags and the recycle bin as sibling routes over one list surface.

## Requirements

### Requirement: The service menu opens from the Resource Explorer home only

The service menu SHALL open from a menu button on the Resource Explorer home page, and SHALL NOT be offered on the other pages of the area.

#### Scenario: Menu button on the home page

- **GIVEN** the owner is on the Resource Explorer home page
- **WHEN** the owner selects the menu button
- **THEN** the service menu opens

#### Scenario: Other pages have no service menu

- **GIVEN** the owner is on a resource page
- **WHEN** the owner looks for the service menu
- **THEN** no service menu button is offered

### Requirement: The open menu leaves the content behind it usable

The open service menu SHALL leave the content behind it readable and clickable.

#### Scenario: Clicking the content while the menu is open

- **GIVEN** the service menu is open over the home page
- **WHEN** the owner clicks a card behind the menu
- **THEN** the card responds to the click

### Requirement: Picking an entry closes the menu

The service menu SHALL close when the owner picks one of its entries.

#### Scenario: Owner picks Favorites

- **GIVEN** the service menu is open
- **WHEN** the owner picks Favorites
- **THEN** the menu closes
- **AND** the Favorites list is shown

### Requirement: The menu offers five views of the resources

The service menu SHALL offer All, Favorites, Recent, Tags and the recycle bin as separate views.

#### Scenario: Owner opens the menu

- **GIVEN** the service menu is open
- **WHEN** the owner reads its entries
- **THEN** All, Favorites, Recent, Tags and Recycle bin are listed

### Requirement: Favorites lists only starred resources

The Favorites view SHALL list only the owner's starred resources, ordered by when each was last updated rather than when it was starred.

#### Scenario: Owner opens Favorites

- **GIVEN** the owner has starred some resources
- **WHEN** the owner opens Favorites
- **THEN** only the starred resources are listed
- **AND** they are ordered by most recently updated first

### Requirement: Recent lists the resources the owner opened

The Recent view SHALL list the resources the owner has opened, most recently opened first, and SHALL show when each was last opened.

#### Scenario: Owner opens Recent

- **GIVEN** the owner has opened several resources
- **WHEN** the owner opens Recent
- **THEN** the resources are listed most recently opened first
- **AND** each row shows when it was last opened

### Requirement: Tags shows each tag with its resource count

The Tags view SHALL list each tag with the number of resources carrying it, and picking a tag SHALL show the All view filtered to that tag.

#### Scenario: Owner picks a tag

- **GIVEN** the Tags view lists a tag carried by three resources
- **WHEN** the owner picks that tag
- **THEN** the All view opens filtered to that tag
- **AND** three resources are listed

### Requirement: Only the current view is highlighted in the menu

The service menu SHALL highlight only the entry for the view the owner is on.

#### Scenario: Owner is on the Favorites view

- **GIVEN** the owner is on the Favorites view
- **WHEN** the owner opens the service menu
- **THEN** only the Favorites entry is highlighted

### Requirement: Home's Recent and Favorites tabs match their menu entries

The Recent and Favorites tabs on the home page SHALL show the same resources and the same empty states as their menu entries.

#### Scenario: Favorites tab with no starred resources

- **GIVEN** the owner has no starred resources
- **WHEN** the owner opens the Favorites tab on the home page
- **THEN** the same empty state is shown as on the Favorites view
