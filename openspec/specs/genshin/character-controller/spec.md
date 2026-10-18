## Purpose

The character's movement through the world as the game moves it — a kinematic capsule stepped by the fixed-step loop through the game's states, standing, walking, running, sprinting and dashing, jumping, falling and plunging, gliding, climbing and swimming, gated by what lies under and before it and by one stamina pool with the game's costs. The states' rules are a pure, tested function; the body's numbers are its body type's, read off its own clips and the game's data, with best estimates every type shares where neither holds them.

## Requirements

### Requirement: The character walks, runs, sprints and dashes on foot

The character SHALL move on foot through standing, walking, running, dashing and sprinting, changing between them as the controls and the ground allow.

#### Scenario: Walk switch walks instead of running

- **GIVEN** the character stands on walkable ground
- **WHEN** a move is held with the walk switch on
- **THEN** the character walks

#### Scenario: Sprint press dashes then sprints

- **GIVEN** the character is running with stamina left
- **WHEN** sprint is pressed and held
- **THEN** the character dashes and then sprints

#### Scenario: Letting go of sprint drops back to running

- **GIVEN** the character is sprinting
- **WHEN** sprint is let go or stamina runs out
- **THEN** the character drops back to running

### Requirement: The character jumps, falls and lands under gravity

The character SHALL rise to its jump height, fall under gravity to a steady top speed, and land on the ground or in deep water.

#### Scenario: Jump rises and falls back

- **GIVEN** the character stands on walkable ground
- **WHEN** jump is pressed
- **THEN** the character rises to its jump height and falls back to the ground

#### Scenario: Walking off a drop falls

- **GIVEN** the ground drops away past what the character can step down
- **WHEN** the character walks off the edge
- **THEN** the character falls

#### Scenario: Landing in deep water starts swimming

- **GIVEN** the character falls into deep water
- **WHEN** it lands
- **THEN** it swims

### Requirement: The glider opens only high enough and plunges on attack

The character SHALL open its glider only when high enough above the ground, and SHALL plunge or close the glider on the player's press.

#### Scenario: Jump high in the air opens the glider

- **GIVEN** the character is in the air high enough above the ground with stamina left
- **WHEN** jump is pressed
- **THEN** the glider opens

#### Scenario: Jump too low opens no glider

- **GIVEN** the character is in the air below the height the glider needs
- **WHEN** jump is pressed
- **THEN** the glider does not open

#### Scenario: Attack from the glider plunges

- **GIVEN** the glider is open
- **WHEN** attack is pressed
- **THEN** the character plunges

#### Scenario: Jump closes the glider into a fall

- **GIVEN** the glider is open
- **WHEN** jump is pressed
- **THEN** the glider closes and the character falls

#### Scenario: Stamina running out closes the glider

- **GIVEN** the glider is open
- **WHEN** stamina runs out
- **THEN** the glider closes and the character falls

### Requirement: The character climbs any surface too steep to walk

The character SHALL climb any surface too steep to walk when it moves into it with at least five stamina.

#### Scenario: Moving into a wall with enough stamina climbs it

- **GIVEN** the character has at least five stamina
- **WHEN** it moves into a surface too steep to walk
- **THEN** it climbs the surface

#### Scenario: Too little stamina cannot start a climb

- **GIVEN** the character has less than five stamina
- **WHEN** it moves into a surface too steep to walk
- **THEN** it does not climb

#### Scenario: Climb jump leaves the wall and resumes climbing

- **GIVEN** the character is climbing
- **WHEN** jump is pressed
- **THEN** it jumps off the wall
- **AND** it climbs again once that jump ends

#### Scenario: Drop or empty stamina lets go of the wall

- **GIVEN** the character is climbing
- **WHEN** drop is pressed or stamina runs out
- **THEN** it lets go and falls

#### Scenario: Reaching the top stands the character on walkable ground

- **GIVEN** the character is climbing
- **WHEN** it reaches the top of the wall
- **THEN** it stands on walkable ground

#### Scenario: A fall is not caught by a wall at once

- **GIVEN** the character has only just begun to fall
- **WHEN** it moves straight into a wall
- **THEN** the wall does not catch it until it has fallen a moment

### Requirement: The character swims in deep water and drowns when stamina runs out

The character SHALL swim in water deeper than it can wade, and SHALL drown when its stamina runs out in water.

#### Scenario: Deep water starts swimming

- **GIVEN** the character enters water deeper than it can wade
- **WHEN** it moves
- **THEN** it swims

#### Scenario: Sprint while swimming makes a swim dash

- **GIVEN** the character is swimming and moving
- **WHEN** sprint is pressed
- **THEN** it makes a swim dash

#### Scenario: Running out of stamina in water drowns the character

- **GIVEN** the character is swimming
- **WHEN** its stamina runs out
- **THEN** it drowns
- **AND** after a while it returns to where its stamina was last full on foot, with stamina refilled

#### Scenario: Ground within wading depth stands the character up

- **GIVEN** the character is swimming
- **WHEN** the ground rises to within wading depth
- **THEN** the character stands

### Requirement: One shared stamina pool is spent and refilled at the game's rates

The character and its party SHALL share one stamina pool that starts at 100, refills at 25 a second after a rest, and is spent by each action at its cost.

#### Scenario: Pool refills after a rest on foot

- **GIVEN** no stamina-costing action has happened for a second and a half
- **WHEN** the character is on foot or in the air outside the glider
- **THEN** the pool refills at 25 a second

#### Scenario: Pool does not refill on a wall, in water or under the glider

- **GIVEN** the character is on a wall, in water or under the glider
- **WHEN** time passes
- **THEN** the pool does not refill

#### Scenario: Dash costs 18 as it starts

- **GIVEN** the character has at least 18 stamina
- **WHEN** a dash starts
- **THEN** 18 stamina is spent

#### Scenario: Sprint costs 18 a second

- **GIVEN** the character is sprinting
- **WHEN** time passes
- **THEN** 18 stamina is spent each second

#### Scenario: Charged attack spends 20

- **GIVEN** the pool holds at least 20 stamina
- **WHEN** a sword's charged attack starts
- **THEN** 20 stamina is spent

#### Scenario: Charged attack that cannot be paid does not start

- **GIVEN** the pool holds less than 20 stamina
- **WHEN** a sword's charged attack is attempted
- **THEN** the charged attack does not start

#### Scenario: Party effect reduces what each action costs

- **GIVEN** a party effect reduces stamina consumption
- **WHEN** an action spends stamina
- **THEN** the reduced amount is spent

### Requirement: Each body type moves by its own numbers

Each character's speeds, heights and thresholds SHALL be those of its own body type, so that sprints and dashes cover different distances as the game's do.

#### Scenario: Tall male covers more ground than short female

- **GIVEN** a tall male and a short female each sprint for the same time
- **WHEN** the distances are compared
- **THEN** the tall male covers more ground

#### Scenario: Switching party character changes the numbers, not the place

- **GIVEN** the party switches to another character
- **WHEN** the next step moves the body
- **THEN** the body moves by the new body type's numbers
- **AND** its place and stamina are unchanged

### Requirement: The character stands on, slides along and is stopped by landmarks

The character SHALL stand on, slide along and be stopped by landmark surfaces, and SHALL be pushed clear of any landmark it overlaps.

#### Scenario: Rise within the step is climbed

- **GIVEN** a rise within the height the character can step up
- **WHEN** it walks into the rise
- **THEN** it climbs the rise

#### Scenario: Rise too steep to walk stops the character

- **GIVEN** a rise steeper than the character can walk
- **WHEN** it walks into the rise
- **THEN** it stops and faces the rise as a wall

#### Scenario: Ceiling stops a jump

- **GIVEN** a ceiling above the character
- **WHEN** it jumps under the ceiling
- **THEN** the jump stops at the ceiling

#### Scenario: Ground too steep to stand on slides the character down

- **GIVEN** the character lands on ground too steep to stand on
- **WHEN** it lands
- **THEN** it slides down the ground

### Requirement: A press made during a frame is read by the next step

A press made during a frame SHALL be read by the next movement step rather than lost.

#### Scenario: Jump pressed in a frame with no step

- **GIVEN** a frame runs no movement step
- **WHEN** jump is pressed in that frame
- **THEN** the next movement step reads the press and the jump starts

### Requirement: Movement is relative to the camera

W SHALL move the character along the camera's facing over the ground, and A and D SHALL move it across that facing.

#### Scenario: W moves away from the camera

- **GIVEN** the camera faces a direction
- **WHEN** W is held
- **THEN** the character moves away from the camera along that facing

#### Scenario: On a wall the keys climb whatever the camera faces

- **GIVEN** the character is against a wall
- **WHEN** W, A or D is held
- **THEN** it climbs up or across the wall
- **AND** the camera's facing makes no difference

### Requirement: A jump from the map places the character on the ground

A jump from the map SHALL place the character standing on the ground at the chosen point, facing its current direction.

#### Scenario: Map jump lands on the ground

- **GIVEN** the player chooses a point on the map
- **WHEN** the jump is made
- **THEN** the character stands on the ground at that point
- **AND** any kit action in progress ends

#### Scenario: Drowning returns the character to the map point

- **GIVEN** the character jumped to a point on the map
- **WHEN** it drowns before its stamina is next full on foot
- **THEN** it returns to that point
