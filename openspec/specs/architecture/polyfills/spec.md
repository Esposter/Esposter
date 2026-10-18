## Purpose

How the app installs a global a supported browser lacks — a deferred head script under /polyfills/ that runs before the bundle, never a plugin or an import, one per global, each carrying the probe that retires it.

## Requirements

### Requirement: The app targets the current release of each major browser engine

The app SHALL support the current release of each major browser engine and nothing older, so an API every current engine ships SHALL be used directly.

#### Scenario: Every current engine ships an API

- **GIVEN** every current browser engine ships an API
- **WHEN** code needs that API
- **THEN** the code uses it directly
- **AND** no older form is written for compatibility

#### Scenario: One current engine still lacks an API

- **GIVEN** one current browser engine lacks an API the code uses
- **WHEN** the app runs in that engine
- **THEN** a stand-in provides the API there
- **AND** the code itself is not written down to an older platform

### Requirement: A stand-in is in place before any module that reads it runs

A stand-in for a missing global SHALL be installed before any module that reads that global is evaluated.

#### Scenario: The app loads in a browser that lacks a global

- **GIVEN** a browser lacks a global the app reads while its modules load
- **WHEN** the app starts
- **THEN** the stand-in is installed before the first module that reads the global is evaluated

### Requirement: A stand-in leaves a native global alone

A stand-in SHALL leave a native implementation of its global in place, so that it does nothing once the browser ships the feature.

#### Scenario: A browser already ships the feature

- **GIVEN** a browser ships the feature the stand-in covers
- **WHEN** the stand-in loads
- **THEN** it changes nothing in that browser

### Requirement: Each stand-in names the browsers it covers and is removed when the feature is baseline

Each stand-in SHALL name the browsers that still lack its feature and SHALL be removed, with any dependency only it uses, once the feature is Baseline.

#### Scenario: A feature becomes Baseline

- **GIVEN** a stand-in's feature has become Baseline
- **WHEN** the stand-in is reviewed
- **THEN** the stand-in and any dependency only it uses are deleted

### Requirement: A web worker installs the stand-ins it reads

A web worker SHALL install any stand-in for a global it reads before reading that global, because the page's own stand-in does not reach a worker's global.

#### Scenario: A worker reads a global the page polyfills

- **GIVEN** a web worker reads a global the page stands in for
- **WHEN** the worker starts
- **THEN** the stand-in is installed in the worker before the worker reads the global

### Requirement: A library is fixed rather than given a stand-in for a global it can do without

A library that reads a global at load time that the app does not need SHALL be changed at its dependency rather than given a stand-in.

#### Scenario: A library reads an unneeded global when it loads

- **GIVEN** a library reads a global at load time that the app never uses
- **WHEN** the app is changed to fix it
- **THEN** the dependency is changed so it no longer reads the global
- **AND** no stand-in is installed for the global
