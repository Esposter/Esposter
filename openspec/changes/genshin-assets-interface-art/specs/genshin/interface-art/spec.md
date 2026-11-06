## ADDED Requirements

### Requirement: Marks and icons are drawn as traced shapes

Each mark, icon and ornament the app draws from the game SHALL be a shape traced from the game's own mark, never an image of it.

#### Scenario: A mark is a vector in the screen

- **GIVEN** a screen that draws a mark traced from the game
- **WHEN** the screen is shown
- **THEN** the mark is drawn as a vector shape
- **AND** no raster copy of the game's mark is loaded for it

#### Scenario: A traced mark replaces its flat stand-in on the achievement screen

- **GIVEN** the achievement screen draws a flat placeholder where a game mark stands
- **WHEN** the screen is shown
- **THEN** the traced mark is drawn in the placeholder's place
- **AND** no flat placeholder is drawn for it

#### Scenario: A traced mail mark replaces its bare mark on the mail screen

- **GIVEN** the mail screen draws a bare mark where a game mark stands
- **WHEN** the screen is shown
- **THEN** the traced mark is drawn in the bare mark's place
- **AND** no bare mark is drawn for it

### Requirement: A stand-in takes the colour its picture measures

A stand-in for a picture SHALL take the mean colour measured from that picture's art, so its place reads in the game's tone.

#### Scenario: A card plate takes its art's measured colour

- **GIVEN** a duel board card whose art is not drawn
- **WHEN** the card is shown
- **THEN** its plate takes the mean colour measured from that art
- **AND** no part of the art is drawn

### Requirement: An item tile shows its icon when one is given

An item tile SHALL show the item's traced icon in its art place when one is given, and its rarity face alone when none is given.

#### Scenario: An item with an icon shows it on its tile

- **GIVEN** a reward list whose item has a traced icon
- **WHEN** the list is shown
- **THEN** the icon is drawn on the item's tile
- **AND** the count is drawn over the tile's strip

#### Scenario: An item without an icon shows its rarity face

- **GIVEN** a reward list whose item has no traced icon
- **WHEN** the list is shown
- **THEN** the tile shows its rarity face and its count

### Requirement: A missing piece is named on its screen's roadmap item

Each piece of the game's art a screen draws as a stand-in SHALL be named as an Asset line on the roadmap item that holds that screen, with its source.

#### Scenario: A stand-in has a roadmap line

- **GIVEN** a screen draws a stand-in for a picture
- **WHEN** the roadmap is read
- **THEN** the roadmap item holding the screen names the picture as an Asset line
- **AND** that line names the picture's source
