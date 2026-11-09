## MODIFIED Requirements

### Requirement: Workflow launches are refused while a reserve holds

While a reserve holds and the resin mod is on, a workflow launch SHALL be refused, with the reserve's summary and what to do instead, unless its script provably runs every agent on haiku.

#### Scenario: Launching a workflow under a reserve

- **GIVEN** a reserve holding
- **WHEN** a workflow launch is requested whose script runs an agent on a model other than haiku, or runs an agent with no model
- **THEN** it is denied with the reserve's summary and a suggestion to launch a haiku agent for cleanup or to leave the unit for after the reset

#### Scenario: A workflow pinned to haiku under a reserve

- **GIVEN** a reserve holding
- **WHEN** a workflow launch is requested whose script runs at least one agent, and every agent in it is launched on the haiku model
- **THEN** it is allowed
- **AND** the script is read inline or from the file at the launch's path

#### Scenario: A saved workflow named under a reserve

- **GIVEN** a reserve holding
- **WHEN** a workflow launch names a saved workflow and gives no script
- **THEN** it is denied with the reserve's summary and a suggestion to launch a haiku agent for cleanup or to leave the unit for after the reset

#### Scenario: A script file that is missing under a reserve

- **GIVEN** a reserve holding
- **WHEN** a workflow launch gives a script path with no file at that path
- **THEN** it is denied with the reserve's summary and a suggestion to launch a haiku agent for cleanup or to leave the unit for after the reset

#### Scenario: A haiku agent launched under a reserve

- **GIVEN** a reserve holding
- **WHEN** a haiku agent launch is requested
- **THEN** it is allowed

#### Scenario: The refusal gate failing

- **GIVEN** the launch gate itself failing
- **WHEN** a workflow launch is requested
- **THEN** the launch goes through
