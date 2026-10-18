## Purpose

The Default/Magical/Physical theming layer — compiled flavor-text variables and per-type name, icon, and color maps.

## Requirements

### Requirement: Clicker type offers exactly three themes

The clicker SHALL offer exactly three types, Default, Magical and Physical, each with its own name for the point.

#### Scenario: Type selector offers the three types

- **GIVEN** a player on the clicker page
- **WHEN** the player opens the type selector in the toolbar
- **THEN** the types Default, Magical and Physical are offered

### Requirement: Switching type changes only how the item looks and is named

The clicker SHALL change the item's name, plural name, icon and colour everywhere on the page when the player switches type, and SHALL leave every purchase and the point count unchanged.

#### Scenario: Switching type reskins the page

- **GIVEN** a player with bought buildings and upgrades
- **WHEN** the player switches the type to Magical
- **THEN** the item's name, plural name, icon and colour change across the page
- **AND** the player's points, buildings and upgrades are unchanged

### Requirement: Chosen type is kept with the save

The clicker SHALL keep the player's chosen type with their save and restore it on the next visit.

#### Scenario: Chosen type survives a reload

- **GIVEN** a player who has switched the type to Physical
- **WHEN** the page is reloaded
- **THEN** Physical is still the selected type
- **AND** the choice was saved as soon as the player made it

### Requirement: Flavor text reads the active type

The clicker SHALL write each building's description once and show the point's name in the words of the active type.

#### Scenario: Description uses the active type's name

- **GIVEN** a building whose description refers to the point by name
- **WHEN** the player switches between the three types
- **THEN** the description names the point in the active type's words in each case

### Requirement: Accent colour follows the site style and mode

The clicker SHALL show each type's accent colour in the site's current style and light or dark mode.

#### Scenario: Accent colour follows dark mode

- **GIVEN** the site is in dark mode
- **WHEN** the player selects a type
- **THEN** that type's accent colour is shown in its dark-mode form
