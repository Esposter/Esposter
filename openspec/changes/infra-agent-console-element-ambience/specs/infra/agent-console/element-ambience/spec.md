## ADDED Requirements

### Requirement: Field intensity follows the loudness of the spoken line

The console SHALL set the element field's intensity from the loudness of the spoken line that is playing, in step with its playback.

#### Scenario: A louder line swells the field

- **GIVEN** the Genshin theme is shown and a reply contains a spoken line
- **WHEN** the line plays
- **THEN** the field swells and follows the line's loudness while it plays

#### Scenario: Muted volume still moves the field

- **GIVEN** the device's volume is muted
- **WHEN** a spoken line plays
- **THEN** the field still follows the line's loudness

#### Scenario: The field settles when the line ends

- **GIVEN** the field is following a spoken line
- **WHEN** the line ends
- **THEN** the field settles back to its idle state

### Requirement: Each element has its own field

The console SHALL draw the field in the preset of the character's element.

#### Scenario: The character's element chooses the field

- **GIVEN** the session's character is of the Hydro element
- **WHEN** the field is drawn
- **THEN** the field shows the Hydro preset with ripples

#### Scenario: A fire character gets the embers field

- **GIVEN** the session's character is of the Pyro element
- **WHEN** the field is drawn
- **THEN** the field shows the Pyro preset with embers

### Requirement: Idle field draws little and hidden page draws nothing

The console SHALL idle the field at its lowest rate when no line is playing and SHALL draw nothing while the page is hidden.

#### Scenario: No line playing idles the field

- **GIVEN** no spoken line is playing
- **WHEN** the reader views the console
- **THEN** the field runs at its lowest rate

#### Scenario: A hidden page draws nothing

- **GIVEN** the field is shown
- **WHEN** the page becomes hidden
- **THEN** the field draws nothing until the page is shown again

### Requirement: The field never leads the voice

The console SHALL start the field when the line's loudness reaches the page and SHALL NOT start it before the line is heard.

#### Scenario: A slow page runs behind the voice, never ahead of it

- **GIVEN** the page is slow to receive a spoken line
- **WHEN** the line plays
- **THEN** the field starts when the line's loudness arrives
- **AND** the field does not move before the voice is heard
