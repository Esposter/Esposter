## Purpose

How vue-phaserjs is tested — a real headless Phaser game under happy-dom, with helpers that drive scene lifecycle deterministically.

## Requirements

### Requirement: Component tests run against a real headless game

The test suites SHALL mount each component against a live headless game and SHALL assert on the game's own state rather than on mock objects.

#### Scenario: A component test checks the game's state

- **GIVEN** a component under test
- **WHEN** its test runs
- **THEN** the component is mounted in a live headless scene
- **AND** the assertions read the game's display list, setters or events

### Requirement: One game boots per suite and is destroyed after it

The test harness SHALL boot one headless game for each suite and SHALL destroy that game when the suite ends.

#### Scenario: A suite shares one game across its tests

- **GIVEN** a suite with several tests
- **WHEN** the suite runs
- **THEN** a single headless game serves all of its tests
- **AND** the game is destroyed when the suite ends

### Requirement: Scene lifecycle handlers fire at their phase and count

The test suites SHALL verify that each lifecycle hook fires at its phase and the number of times it should, and SHALL verify that a handler registered for one scene does not fire when another scene advances.

#### Scenario: A lifecycle handler fires the expected number of times

- **GIVEN** a scene whose update handler is registered
- **WHEN** the scene is stepped a fixed number of times
- **THEN** the handler runs that number of times

#### Scenario: A handler of one scene does not fire for another

- **GIVEN** two scenes each with an update handler
- **WHEN** only one scene is stepped
- **THEN** only that scene's handler runs

### Requirement: Setter behaviour is covered once for all game objects

The test suites SHALL cover setter behaviour once, generically, rather than repeating it for each setter.

#### Scenario: A new setter needs no test of its own

- **GIVEN** a new setter added to a game object
- **WHEN** the suite runs
- **THEN** the generic setter tests cover its initial application and its reactive updates

### Requirement: Preload tests do not assert on assets the headless game cannot load

The test suites SHALL either skip asset assertions in preload tests or stub the textures they need, because asset loading fails in headless mode without real files.

#### Scenario: A preload test stubs its texture

- **GIVEN** a preload test that needs a texture
- **WHEN** the test runs
- **THEN** the texture is stubbed in place of a loaded file
