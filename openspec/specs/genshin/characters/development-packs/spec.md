## Purpose

Under nuxt dev the development server serves the developer's own extracted official packs from disk, and no build registers the route.

## Requirements

### Requirement: Packs are served only under the development server

The development server SHALL serve the developer's extracted character packs only while the app runs under nuxt dev, and a production build SHALL register no route for them.

#### Scenario: Development server serves the packs

- **GIVEN** the app runs under nuxt dev
- **WHEN** the character packs' address is requested
- **THEN** the packs are served

#### Scenario: Production build serves no packs

- **GIVEN** the app is built for production
- **WHEN** it runs
- **THEN** no route for the packs is registered
- **AND** the world is handed no address to fetch packs from

### Requirement: A character's pack is answered only from its own folder

The development server SHALL answer a character's pack only from the folder named by that character's id, and SHALL answer no file that the folder does not hold.

#### Scenario: Index lists the characters with a folder

- **GIVEN** the packs' directory holds folders named by character ids
- **WHEN** the index is requested
- **THEN** each of those ids is listed

#### Scenario: Model is served from the character's folder

- **GIVEN** a character's folder holds a model
- **WHEN** the model is requested
- **THEN** the model is served

#### Scenario: Unknown character gets not found

- **GIVEN** no folder is named by the requested character's id
- **WHEN** the pack is requested
- **THEN** the request gets a not-found response

#### Scenario: Missing texture gets not found

- **GIVEN** a model names a texture its folder does not hold
- **WHEN** the texture is requested
- **THEN** the request gets a not-found response

#### Scenario: Request leaving the folder gets nothing

- **GIVEN** a request names a file outside the character's folder
- **WHEN** the request is answered
- **THEN** no file is served

### Requirement: Each request reads the pack from disk afresh

The development server SHALL read each pack from disk on every request, so an edited pack is served as it stands on the next request.

#### Scenario: Edited file is served on the next request

- **GIVEN** a file in a character's folder is changed on disk
- **WHEN** the next request for that file is made
- **THEN** the changed file is served
