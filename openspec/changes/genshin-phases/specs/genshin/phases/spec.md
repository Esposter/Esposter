## ADDED Requirements

### Requirement: Every unit of Genshin work belongs to exactly one phase

Every open Genshin change and every open item of the Genshin roadmap SHALL name the lowest phase whose exit gate fails without it, and a compute item SHALL take the phase of the area it measures.

#### Scenario: A genshin change names its phase

- **GIVEN** an open change whose first affected area is genshin
- **WHEN** its metadata is read
- **THEN** it names exactly one phase

#### Scenario: A task holds its change's phase unless it names another

- **GIVEN** a change at phase 4 with a task marked phase 6 and a task with no marker
- **WHEN** the tasks' phases are read
- **THEN** the marked task holds phase 6 and the other holds phase 4

#### Scenario: A change's phase is its lowest open task's

- **GIVEN** a change at phase 2 whose only open task is marked phase 4
- **WHEN** the workspace's changes are checked
- **THEN** the check fails and names phase 4 as the change's phase

#### Scenario: A change's pick phase is its lowest open task's

- **GIVEN** a change at phase 4 with a done task marked phase 2, and open tasks marked phase 4 and phase 6
- **WHEN** the fleet reads the change's phase
- **THEN** the change is offered at phase 4, since the done task's marker does not count

#### Scenario: An open roadmap item sits in a phase section

- **GIVEN** the Genshin roadmap with an open item
- **WHEN** the roadmap is read
- **THEN** the item sits under the heading of one phase

#### Scenario: A compute item takes its area's phase

- **GIVEN** a compute page for an area that holds a phase
- **WHEN** its items are classified
- **THEN** each item has that area's phase

### Requirement: Work is taken from the lowest phase with a runnable unit

The fleet SHALL offer a machine the first unit of the lowest phase that the machine can run and no claim holds, and SHALL pass over a phase whose units all wait on the other machine or an input.

#### Scenario: The lowest phase with a runnable unit is taken first

- **GIVEN** open units in phases 1 and 3, both runnable on this machine
- **WHEN** the machine asks for its next unit
- **THEN** it is offered the phase 1 unit

#### Scenario: A phase whose units wait on the other machine is passed over

- **GIVEN** every open unit of phase 1 needs the game install this machine lacks, and a unit of phase 3 is runnable
- **WHEN** the machine asks for its next unit
- **THEN** it is offered the phase 3 unit

### Requirement: A unit is done when its own source drains, and its kind's check gates its phase

The progress report's done column SHALL count a unit once its own source has nothing left open: a compute page with no queue item and no waiting item, where an open line with no id counts as a waiting item, a change with no open task, or a roadmap item or quest ticked. Each kind's check SHALL be reported apart from that column as met, not met or not measurable, and only those checks SHALL gate a phase. A check that no command can read SHALL be reported as not measurable and never as met.

#### Scenario: A screen's check is met when every id is under its bar

- **GIVEN** a screen with three parity ids, each under its bar
- **WHEN** the screen's check is read
- **THEN** the check is met and names no id

#### Scenario: A screen's check is not met when an id is over its bar

- **GIVEN** a screen with three parity ids, two under their bars and one over
- **WHEN** the screen's check is read
- **THEN** the check is not met and names the id over its bar, so the screen does not gate its phase

#### Scenario: A check with no command is not measurable

- **GIVEN** a quest unit and no scripted-session harness
- **WHEN** the report reads the quest's check
- **THEN** the check prints as not measurable

#### Scenario: A scripted session plays a quest to its end across a save and a load

- **GIVEN** a quest unit and the scripted-session harness
- **WHEN** the harness plays the quest from a script with a save and a load in the middle
- **THEN** the quest reaches its end and what it changed in the world persists across the load

#### Scenario: A screen kind whose claimed opener does not hold is unreachable

- **GIVEN** a screen kind whose table entry says the Paimon menu opens it and a menu that does not list it
- **WHEN** the reachability check runs
- **THEN** the check fails and names the screen kind

### Requirement: Progress is computed from the tree

The progress report SHALL derive every phase's counts from the checkboxes, the compute pages and the units' needs, and no page SHALL restate a count.

#### Scenario: A phase's progress counts its units by kind

- **GIVEN** a phase with two screens, one of them done, and one region
- **WHEN** the report is printed
- **THEN** the phase lists two screens with one done and one region

### Requirement: A scripted session changes the world only through the registry and the frame clock

A scripted session SHALL change and read the world only through the developer registry, SHALL move time only in fixed frames, and SHALL draw its randomness and its clock from fixed sources, so a run and its repeat read the same values.

#### Scenario: A frame advances the clock by one fixed step

- **GIVEN** a scripted clock with the frame clock faked
- **WHEN** the runner steps one frame
- **THEN** the clock advances by one fixed step and by no more

#### Scenario: Two runs of a script read the same values

- **GIVEN** a script run from the new game with its random source and clock fixed
- **WHEN** the script is run a second time from the new game
- **THEN** every reading it takes is the same in both runs

### Requirement: The game's reads each answer one value, and a hold presses a control for seconds

The developer registry SHALL offer a hold that presses a control for seconds, and SHALL offer the reads a script asserts: a quest's step, an item's count, the Archive's defeats, the open screen and whether the terrain is settled. Each read SHALL answer one value.

#### Scenario: A hold command holds a control for its seconds

- **GIVEN** a control with bound keys and a registered hold
- **WHEN** the line holds it for two seconds
- **THEN** its key is down at the first frame and up once two seconds of frames have passed

#### Scenario: A quest read answers the step its progress is on

- **GIVEN** a quest in progress on its second of three steps
- **WHEN** the quest's read runs
- **THEN** it answers step two of three, and finished once every step is past

#### Scenario: A bag read counts an item across the bag and the wallet

- **GIVEN** an item held in the bag and a currency held in the wallet
- **WHEN** the read names each by the name the game shows
- **THEN** each answers its count across the bag and the wallet together

#### Scenario: A kills read counts the defeats the Archive holds

- **GIVEN** an Archive that has counted three defeats
- **WHEN** the kills read runs
- **THEN** it answers three

#### Scenario: A screen read names the open screen

- **GIVEN** the Paimon menu open over the world
- **WHEN** the screen read runs
- **THEN** it answers the Paimon menu's screen kind

#### Scenario: A settled read reports tiles in flight

- **GIVEN** a terrain tile asked for and not yet given
- **WHEN** the settled read runs
- **THEN** it answers no, and yes once the tile is given
- **AND** with nothing in flight, a wanted tile not yet asked for still makes it answer no

### Requirement: A script stops at its first failed step and compares one value exactly

A scripted session SHALL run its steps in order and stop at the first step that fails, naming that step. An expect step SHALL compare one value, or one field of the state record, with the expected text exactly. A scripted session SHALL settle the terrain after each run of lines, and SHALL fail once the terrain stays unsettled past the frame limit; the driver settles before each save.

#### Scenario: A failed line stops the script and names it

- **GIVEN** a script whose second line is refused
- **WHEN** the script runs
- **THEN** its third step does not run and the failure names the second line

#### Scenario: An expect step compares one field of a record exactly

- **GIVEN** a state record whose place field reads Windrise
- **WHEN** an expect step names the place field as Liyue
- **THEN** the step fails and names the field with both values

#### Scenario: A step that never settles fails the script

- **GIVEN** a driver whose settled read never answers yes
- **WHEN** a script with a line and then a save runs
- **THEN** the script fails naming the step, with the words not settled

#### Scenario: A line settles the terrain before the next step

- **GIVEN** a driver whose settled read answers no once and then yes
- **WHEN** a script with a line and then an expect step on that line's record runs
- **THEN** the runner steps the settle's minimum frames before its first read, then one more frame for the no, and the expect step reads once the terrain reads settled

### Requirement: A save in a script is the page's save, and a load resumes it in a fresh session

A save SHALL pass the world's last save through the save schema, and a save the schema refuses SHALL fail the script. A load SHALL mount a fresh session from that save, so the readings the save holds read the same after the load.

#### Scenario: A load restores what the save holds

- **GIVEN** a quest's step, an item's count and an Archive defeat read before a save
- **WHEN** the script loads the save into a fresh session
- **THEN** the same step, count and defeat read after the load

#### Scenario: A save the schema refuses fails the script

- **GIVEN** a world save that the save schema refuses
- **WHEN** the script saves
- **THEN** the script fails and names the schema's message

### Requirement: A quest with a script is reported as scripted and never as done

The progress report SHALL print a quest that a scripted session names as scripted and leave it open until its checkbox is ticked, and SHALL run no browser to decide it.

#### Scenario: A quest with a script is reported as scripted, not done

- **GIVEN** a quest a scripted session names and a quest no session names
- **WHEN** the report is printed
- **THEN** the first is scripted and open, and the second is not measurable
