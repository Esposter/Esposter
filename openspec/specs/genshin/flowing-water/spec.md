## Purpose

Genshin's rivers and waterfalls in the anime style, built on the still water's material. A flow carries the ripples and foam downstream, a river is a ribbon along its course at the water's width and level whose bends gather foam on their outer bank, and a waterfall is a sheet whose streaks fall with its height. The game's own courses and falls are fitted in a later pass.

## Requirements

### Requirement: Still water has no flow

Still water, such as the sea and lakes, SHALL draw with a flow of zero, so its ripples and foam do not move.

#### Scenario: Sea draws without movement

- **GIVEN** a region's sea or lake is shown
- **WHEN** time passes
- **THEN** its ripples and foam do not move downstream

### Requirement: A flow carries ripples and foam downstream

A flowing water surface SHALL carry its ripples and foam downstream at its flow's speed in its direction.

#### Scenario: Pattern moves with the flow

- **GIVEN** a river surface has a flow in a direction
- **WHEN** time passes
- **THEN** its ripples and foam move downstream along that direction

### Requirement: A river is a ribbon along its course

A river SHALL be a ribbon laid along its course, each course point at its level and across its width, centred on the course.

#### Scenario: Ribbon spans the river's width

- **GIVEN** a river course with points at a level and a width
- **WHEN** the river is drawn
- **THEN** each point spans the river's width across the course at its level

#### Scenario: Turn straight back takes the way it came in

- **GIVEN** a course point where the course turns straight back
- **WHEN** the river is drawn
- **THEN** that point takes the direction the course came in with

#### Scenario: Point with no direction narrows to nothing

- **GIVEN** a course point with no direction at all
- **WHEN** the river is drawn
- **THEN** that point draws no width

### Requirement: Foam gathers on the outer bank of a bend

A river's foam SHALL gather on the outer bank of each bend, more strongly the tighter the bend, and SHALL fade to none across the river toward the inner bank.

#### Scenario: Tight bend foams fully

- **GIVEN** a river bends tightly relative to its width
- **WHEN** the river is drawn
- **THEN** the outer bank of the bend is full of foam

#### Scenario: Gentle bend shows only a trace of foam

- **GIVEN** a river bends gently relative to its width
- **WHEN** the river is drawn
- **THEN** the outer bank shows only a trace of foam

#### Scenario: Inner bank gathers no bend foam

- **GIVEN** a river bend
- **WHEN** the river is drawn
- **THEN** the inner bank gathers no foam from the bend

### Requirement: A waterfall falls as a sheet from its lip

A waterfall SHALL be a sheet hung from its lip down by its drop, with streaks falling along its height and clear between the streaks.

#### Scenario: Sheet hangs from the lip to the pool

- **GIVEN** a waterfall has a lip with a width and a drop
- **WHEN** the waterfall is drawn
- **THEN** its sheet hangs from the lip down by the drop

#### Scenario: Streaks fall with the sheet's height

- **GIVEN** a waterfall sheet is drawn
- **WHEN** the streaks are shown
- **THEN** each streak falls along the sheet and the sheet is clear between the streaks

### Requirement: Rivers and recorded waterfalls are not drawn in the open world yet

The open world SHALL NOT yet draw its rivers or the waterfalls its region data records.

#### Scenario: Region with rivers shows no river

- **GIVEN** a region has rivers in the game
- **WHEN** the world is shown
- **THEN** no river is drawn

#### Scenario: Recorded waterfall is not drawn

- **GIVEN** a region's data records a waterfall
- **WHEN** the world is shown
- **THEN** no waterfall sheet is drawn
