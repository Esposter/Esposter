## ADDED Requirements

### Requirement: A followed Seelie is led home to its court

A Seelie SHALL move along its route toward its court while the player follows it, and SHALL settle at its court and spawn its chest.

#### Scenario: A followed Seelie reaches its court and spawns its chest

- **GIVEN** a Seelie is paired with a court
- **AND** the player follows it within reach
- **WHEN** the Seelie reaches its court
- **THEN** the Seelie settles at the court
- **AND** its chest spawns

#### Scenario: A Seelie left unfollowed returns to its start

- **GIVEN** a Seelie is part way to its court
- **WHEN** the player leaves it unfollowed past its return time
- **THEN** the Seelie goes back to its start

### Requirement: Each court pairs with one Seelie, closest first

Each Mondstadt Seelie court SHALL be paired with one Seelie, the closest pairs first, so that no court or Seelie is paired twice.

#### Scenario: The closest court and Seelie pair first

- **GIVEN** two courts and three Seelies are placed
- **WHEN** the courts are paired
- **THEN** the closest court and Seelie pair first
- **AND** the third Seelie rests where it stands

### Requirement: An Elemental Monument lights when struck by its element

An Elemental Monument SHALL light when struck by its element, including when a reaction produces that element on it.

#### Scenario: A strike of its element lights a monument

- **GIVEN** a monument is unlit
- **WHEN** it is struck by its element
- **THEN** it lights

#### Scenario: A reaction of its element lights a monument

- **GIVEN** a monument is unlit
- **WHEN** a reaction produces its element on it
- **THEN** it lights

#### Scenario: A strike of another element does not light a monument

- **GIVEN** a monument is unlit
- **WHEN** it is struck by a different element
- **THEN** it stays unlit

### Requirement: A timed monument goes out after its time

A timed monument SHALL go out once its time passes since its last strike.

#### Scenario: A timed monument goes out after its time

- **GIVEN** a timed monument is lit
- **WHEN** its time passes since its last strike
- **THEN** it goes out

### Requirement: A puzzle of monuments is solved when lit together

A puzzle of monuments SHALL be solved once every one of its monuments is lit at the same time, and SHALL stay solved afterward.

#### Scenario: Lighting every monument together solves the puzzle

- **GIVEN** two of the puzzle's monuments are lit
- **WHEN** the last of its monuments is lit while the others stay lit
- **THEN** the puzzle is solved

#### Scenario: A monument going out first leaves the puzzle unsolved

- **GIVEN** all but one of the puzzle's monuments are lit
- **WHEN** one of the lit monuments goes out before the last is lit
- **THEN** the puzzle stays unsolved

#### Scenario: A solved puzzle stays solved

- **GIVEN** the puzzle is solved
- **WHEN** its monuments go out
- **THEN** the puzzle stays solved

### Requirement: A Time Trial Challenge spawns its chest only when every target is done in time

A Time Trial Challenge SHALL spawn its chest only when every target is done before its timer ends.

#### Scenario: Finishing every target in time spawns the chest

- **GIVEN** a Time Trial Challenge is started
- **WHEN** every target is done before its timer ends
- **THEN** the chest spawns

#### Scenario: A missed target before the timer ends gives no chest

- **GIVEN** a Time Trial Challenge is started
- **WHEN** its timer ends with a target not done
- **THEN** no chest spawns

### Requirement: A Shrine of Depths opens only with a key from its own region

A Shrine of Depths SHALL open only with a key from its own region, which the opening spends, and SHALL hold a Luxurious chest. A shut shrine SHALL be offered to open only while the bag holds a key of its region.

#### Scenario: A shrine opens with its region's key

- **GIVEN** the player holds a Shrine of Depths key from the shrine's region
- **WHEN** the player uses it on the shrine
- **THEN** the shrine opens
- **AND** the key is spent from the bag
- **AND** the shrine stays open after a reload
- **AND** its Luxurious chest is there to open

#### Scenario: A shut shrine is offered while its region's key is held

- **GIVEN** the shrine stands shut in the world
- **WHEN** the player holds a key of the shrine's region
- **THEN** the shrine is offered beneath its point to open

#### Scenario: A key from another region is refused

- **GIVEN** the player holds a Shrine of Depths key from another region
- **WHEN** the player tries it on the shrine
- **THEN** the shrine stays shut

#### Scenario: A shut shrine is not offered without its region's key

- **GIVEN** the player holds no key of the shrine's region, only another region's key
- **WHEN** the player stands beside the shrine
- **THEN** the shrine is not offered, and the other region's key stays in the bag
