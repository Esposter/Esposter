## Purpose

How a package becomes a dist — one bundler, one shared configuration package, and a published surface the build refuses to get wrong.

## Requirements

### Requirement: Every package is built by one bundler from its source entry

Every workspace package SHALL be built by the same bundler from its source entry, producing its built output and its type declarations.

#### Scenario: A package build produces its output and declarations

- **WHEN** a package is built
- **THEN** its output and its type declarations are written from its source entry

#### Scenario: Components compile the same way in the build and in tests

- **GIVEN** a package that ships interface components
- **WHEN** the package is built and when its tests run
- **THEN** each component compiles to the same result in both

### Requirement: The public entry is regenerated from the source modules on every build

The public entry of a package SHALL be regenerated from its source modules on every build, so that a new module is exported at the package's next build.

#### Scenario: A new module is exported after the next build

- **GIVEN** a new module added to a package
- **WHEN** the package is next built
- **THEN** the module's exports are part of the package's public entry

#### Scenario: Two modules exporting one name fail the typecheck

- **GIVEN** two source modules exporting the same name
- **WHEN** a sibling package typechecks against the source
- **THEN** the typecheck fails with a duplicate-name error rather than dropping one of the names

### Requirement: A published package externalises exactly what its consumer installs

A published package SHALL leave external exactly the dependencies its consumer installs, and SHALL bundle the development-only inputs its source imports.

#### Scenario: A runtime dependency stays external

- **GIVEN** a dependency declared in the package's runtime dependencies
- **WHEN** the package is built
- **THEN** the dependency is imported from the consumer's installation and not bundled

#### Scenario: A development-only import is bundled

- **GIVEN** a development-only dependency imported by the package's source
- **WHEN** the package is built
- **THEN** the imported code is bundled into the output

### Requirement: A build fails when its output imports something its manifest does not declare

A package build SHALL fail when its emitted output imports anything the package's manifest does not declare.

#### Scenario: An undeclared import fails the build

- **GIVEN** a source import of a package the manifest does not declare
- **WHEN** the package is built
- **THEN** the build fails and names the undeclared import

### Requirement: A published package passes its installability gates

A published package SHALL fail its build when a manifest entry points at a file missing from the package, or when its declarations break under a consumer's module resolution.

#### Scenario: A manifest entry naming a missing file fails the build

- **GIVEN** a published package whose manifest names a file the package does not ship
- **WHEN** the package is built
- **THEN** the build fails

#### Scenario: Declarations that break for a consumer fail the build

- **GIVEN** a published package whose declarations fail under a module resolution a consumer may use
- **WHEN** the package is built
- **THEN** the build fails

### Requirement: A private package skips the published gates and emits no declarations

A private package SHALL be built without the published-package gates and SHALL emit no type declarations.

#### Scenario: A private package builds without the published gates

- **GIVEN** a private package
- **WHEN** the package is built
- **THEN** the published-package gates do not run and no declarations are written

### Requirement: Source is visible to tools that opt in and built output to everything else

Each package SHALL expose its own source to tools that opt in, and its built output to every other consumer, so that an edit reaches a sibling's tests without a rebuild.

#### Scenario: A sibling's tests see an edit without a rebuild

- **GIVEN** an edit to a package's source
- **WHEN** a sibling's tests run through a tool that opts in
- **THEN** the sibling sees the edit without rebuilding the package

#### Scenario: A runtime loader uses the built output

- **WHEN** a plain runtime loader imports the package
- **THEN** it loads the built output

### Requirement: The development server starts only after every package build succeeds

The development server SHALL start only after every package build has succeeded, so that the page never runs code a failed build rejected.

#### Scenario: A failed package build stops the development server

- **GIVEN** a package whose build fails
- **WHEN** the development server is started
- **THEN** the server does not start

### Requirement: A standard build removes previous output before writing

A standard build SHALL remove the previous output before writing new output, so that a changed build never leaves old files beside new ones.

#### Scenario: Old output files do not survive a rebuild

- **GIVEN** a package with output from an earlier build
- **WHEN** the package is rebuilt by a standard build
- **THEN** the output contains only files from the new build

### Requirement: Every package declares whether its modules have side effects

Every package SHALL declare whether its modules have side effects, so that unused code can be removed safely from a consumer's bundle.

#### Scenario: A package whose entry registers handlers keeps them

- **GIVEN** a package whose entry registers handlers when loaded
- **WHEN** a consumer bundles the package
- **THEN** the registrations are kept in the bundle
