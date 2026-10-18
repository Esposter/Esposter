## ADDED Requirements

### Requirement: Passes run in dependency order behind their gates

A pass SHALL not begin until every pass it depends on is within its gate, and a run that breaks this order SHALL be refused.

#### Scenario: A pass waits for the gates of the passes before it

- **GIVEN** the layout pass is outside its gate
- **WHEN** the light pass is started
- **THEN** the run is refused
- **AND** the run names the layout pass as the one still open

### Requirement: A pass is judged by its own measure and then frozen

Each pass SHALL be judged by its own measure in screen units rather than the frame's score, and a pass within its gate on every reference SHALL be frozen.

#### Scenario: A pass within its gate on every reference is frozen

- **GIVEN** a pass's measure is within the reference's noise on every reference
- **WHEN** the pass is closed
- **THEN** its result is held by a test
- **AND** later passes do not re-run it

#### Scenario: A later pass cannot move a frozen result

- **GIVEN** a pass is frozen
- **WHEN** a later pass changes its result
- **THEN** the run is refused and the frozen pass is named

### Requirement: A frame that stands off reopens the pass whose measure missed it

When every gate holds and the frame's perceptual score stands off, the pass whose measure missed the difference SHALL reopen.

#### Scenario: A frame that stands off reopens the missed pass

- **GIVEN** every pass's gate holds
- **WHEN** the frame's perceptual score stands off on a reference
- **THEN** the pass whose measure missed the difference reopens
- **AND** its measure is fixed before the pass runs again

### Requirement: Scattered content is matched by its statistics

Scattered content such as clouds SHALL be matched by its cover, size and colour spread rather than by a pixel score.

#### Scenario: Scattered clouds are scored by their statistics

- **GIVEN** a frame shows the game's scattered clouds
- **WHEN** the clouds are compared with the reference
- **THEN** they are compared by cover, size and colour spread
- **AND** no pixel score decides them

#### Scenario: A cloud layer that wins only on pixels is not accepted

- **GIVEN** a cloud layer scores better on pixels than on statistics
- **WHEN** the cloud pass is closed
- **THEN** the layer is not accepted

### Requirement: The login scene glows its bright pixels as the game does

The login scene SHALL draw bloom on pixels brighter than the game's threshold, before the tone curve.

#### Scenario: Bright stone in the login scene glows

- **GIVEN** the login scene shows stone brighter than the threshold
- **WHEN** the frame is drawn
- **THEN** the bright stone glows past its edges

### Requirement: Bloom is judged on the brightest pixels of each reference

The bloom SHALL be judged on the brightest pixels of each reference, and SHALL close only where drawn bloom reads closer than no bloom.

#### Scenario: Bloom closes where it brings the brightest pixels closer

- **GIVEN** a reference has brightest pixels at the curve's white
- **WHEN** the bloom is drawn and compared with it off
- **THEN** the bloom closes only where the drawn bloom reads closer

#### Scenario: A bloom that reads no closer reopens its field

- **GIVEN** the drawn bloom reads no closer than no bloom on a reference
- **WHEN** the bloom is judged
- **THEN** the bloom's field is re-read

### Requirement: Each hour's clouds match its reference statistics

The login's cloud layer SHALL match each hour's cover and size statistics within the reference's noise.

#### Scenario: Each hour's cloud layer matches its reference

- **GIVEN** a reference frame at an hour
- **WHEN** the cloud layer is compared at that hour
- **THEN** its cover and size fall within the reference's noise

#### Scenario: An hour whose clouds miss their gate is not accepted

- **GIVEN** an hour's cloud layer misses its gate on a reference
- **WHEN** the login is checked
- **THEN** that hour is not accepted
