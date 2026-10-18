## Purpose

What a parity loop costs to run, how a scene's cost is benched, and how a surface's structure is reduced on the GPU.

## Requirements

### Requirement: Each parity step finishes in seconds

Each parity step SHALL finish in seconds, so that the loop can run as often as a test would.

#### Scenario: Parity page brought up

- **GIVEN** an operator starts the parity page
- **WHEN** the page is requested
- **THEN** the page is up in about a second

#### Scenario: Comparison with its shot

- **GIVEN** a reference to compare
- **WHEN** the comparison runs, shot included
- **THEN** it finishes in a few seconds

#### Scenario: Visual suite run

- **GIVEN** the visual suite runs over several screens
- **WHEN** the first screen is rendered
- **THEN** it takes a few seconds
- **AND** each further screen takes a fraction of that

#### Scenario: Trace at full resolution

- **GIVEN** a mark traced at its full resolution
- **WHEN** the trace runs
- **THEN** it finishes in a second or two

### Requirement: Each command closes the browser it opened

Each parity command SHALL close the browser it opened when its work is done.

#### Scenario: Command finished

- **GIVEN** a parity command has finished its work
- **WHEN** the operator checks for running browsers
- **THEN** the browser the command opened has closed

### Requirement: The parity page is served once per checkout on a port the operator can change

The parity page SHALL be served once per checkout, on a port the operator can change.

#### Scenario: Two checkouts served at once

- **GIVEN** two checkouts each serve a parity page
- **WHEN** both pages are up
- **THEN** each checkout's page is served on its own port

### Requirement: A scene's cost is benched rather than guessed

A scene's cost SHALL be measured by its bench, which reports the scene's frame time, the share of each frame the main thread is busy, and what the scene draws and keeps.

#### Scenario: Bench run on a scene

- **GIVEN** a scene to bench
- **WHEN** the bench runs
- **THEN** the median frame time and the frame time of the slowest tenth are printed
- **AND** the main thread's busy time per frame is printed beside them
- **AND** the draw calls, the triangles and the objects drawn by kind are printed
- **AND** the pipelines, geometries and textures the scene keeps are printed

#### Scenario: Resources that grow between benches

- **GIVEN** a scene whose kept resources grow from one bench to the next
- **WHEN** the benches are compared
- **THEN** the growth shows as a leak in the scene

### Requirement: A surface's structure is reduced on the GPU

A surface's structure statistics SHALL be computed on the GPU of the parity page, so that only partial sums return to the host.

#### Scenario: Surface pass run

- **GIVEN** a surface pass over a component's families
- **WHEN** the pass computes each family's statistics
- **THEN** the blurs and the sums run on the parity page's GPU
- **AND** only partial sums are read back

#### Scenario: Windrise pass

- **GIVEN** the windrise surface pass
- **WHEN** its structure is reduced on the GPU
- **THEN** the pass finishes in a few minutes rather than many

### Requirement: The comparison keeps its scoring on the CPU

The compare command SHALL keep its scoring on the CPU.

#### Scenario: Comparison scored

- **GIVEN** a comparison run
- **WHEN** it scores the shot against its reference
- **THEN** the scoring runs on the CPU
