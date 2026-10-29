# genshin/characters/development-packs Specification

## Purpose

Under nuxt dev the development server serves the developer's own exports of the game's scenes from disk, and no build registers the route.

## Requirements

### Requirement: Scene exports are served only under the development server

The development server SHALL serve the developer's scene exports only while the app runs under nuxt dev, and a production build SHALL register no route for them.

#### Scenario: Development server serves the scene exports

- **GIVEN** the app runs under nuxt dev
- **WHEN** a scene export is requested at the exports' address
- **THEN** the export is served

#### Scenario: Production build serves no scene exports

- **GIVEN** the app is built for production
- **WHEN** it runs
- **THEN** no route for the scene exports is registered
- **AND** the world is handed no address to fetch scene exports from

### Requirement: The scene export route answers only from the components its index lists

The development server SHALL answer a scene export only from a component the export index lists, and SHALL answer not found for any file that component does not hold.

#### Scenario: Index lists the components with a layout or an avatar

- **GIVEN** the exports' folder holds components with a layout or an avatar
- **WHEN** the index is requested
- **THEN** each of those components is listed

#### Scenario: A listed component's root file is served

- **GIVEN** a listed component holds the requested root file, its layout or its avatar's manifest or binary
- **WHEN** the file is requested
- **THEN** the file is served

#### Scenario: A listed component's asset is served

- **GIVEN** a listed component's assets folder holds the requested mesh or texture
- **WHEN** the file is requested
- **THEN** the file is served

#### Scenario: Unlisted component gets not found

- **GIVEN** the requested component is not in the index
- **WHEN** a file of that component is requested
- **THEN** the request gets a not-found response

#### Scenario: Missing file gets not found

- **GIVEN** a listed component does not hold the requested file
- **WHEN** the file is requested
- **THEN** the request gets a not-found response

#### Scenario: Request leaving the assets folder gets not found

- **GIVEN** a request names a path that climbs out of a component's assets folder
- **WHEN** the request is answered
- **THEN** the request gets a not-found response

### Requirement: Each request reads the scene export from disk afresh

The development server SHALL read each scene export from disk on every request, so an export written again is served as it stands on the next request.

#### Scenario: Rewritten export is served on the next request

- **GIVEN** a file of a listed component is written again on disk
- **WHEN** the next request for that file is made
- **THEN** the rewritten file is served
