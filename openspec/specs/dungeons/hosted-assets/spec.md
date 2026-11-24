# dungeons/hosted-assets Specification

## Purpose

The dungeons game loads every file its engine reads from its hosted objects, so the app's bundle holds none of them, and its saved values keep their textures.

## Requirements

### Requirement: The dungeons game loads its engine files from hosted objects

The dungeons game SHALL load every image, sound, font and Tiled file its engine reads from the hosted objects of its product, and the app's bundle SHALL hold none of those files.

#### Scenario: A texture the scene draws comes from its hosted url

- **GIVEN** the title scene draws its background texture
- **WHEN** the game loads
- **THEN** the texture is requested from the product's absolute url for its key
- **AND** the app's bundle contains no copy of the texture

#### Scenario: A file the code never loads is not hosted

- **GIVEN** an attribution notice that no code imports
- **WHEN** the dungeons game publishes its objects
- **THEN** the notice is not published as an object

### Requirement: The Preloader shows one bar for the download of its objects

The dungeons Preloader SHALL show one loading bar whose share is the download of the hosted objects the browser lacks, and SHALL start the title scene only after the engine's own load completes.

#### Scenario: A first visit shows the download on the bar

- **GIVEN** a browser holding none of the game's objects
- **WHEN** the Preloader mounts
- **THEN** the bar advances with the bytes downloaded
- **AND** the title scene starts after the engine's load completes

#### Scenario: A failed download does not start the game

- **GIVEN** a download in which an object fails its attempts
- **WHEN** the Preloader stops
- **THEN** the title scene does not start
- **AND** the failed object's path is reported

### Requirement: A saved monster or capture item keeps its texture after the move

A saved monster or capture item SHALL resolve its texture from its species or item id, so a value saved before this change SHALL render the same texture and no stored value SHALL change shape.

#### Scenario: A monster saved before the change renders its portrait

- **GIVEN** a saved monster whose species was saved before the move
- **WHEN** the battle draws the monster
- **THEN** the portrait is the species' hosted portrait
- **AND** the saved value parses unchanged

#### Scenario: A capture with a saved ball without a texture field still captures

- **GIVEN** a saved inventory holding a Damaged Ball saved without any texture field
- **WHEN** the player captures a monster with it
- **THEN** the capture completes with the ball's hosted texture

#### Scenario: An unknown species fails its lookup

- **GIVEN** a saved monster whose species is not in the key map
- **WHEN** the battle draws the monster
- **THEN** the lookup fails with the species named
