## Purpose

The Paimon menu's runs: the quit prompt fitted to its whole frame, the menu's open and close timed, and the reputation reward page compared against its frame.

## Requirements

### Requirement: The quit prompt

The quit prompt SHALL be fitted to a whole frame of its current three-button build before its placement is read from pixels.

#### Scenario: Without a current-build frame the prompt keeps its provisional unit

- **GIVEN** no whole frame of the current three-button prompt has been found
- **WHEN** the prompt's placement is considered
- **THEN** the prompt keeps the provisional 1080 high unit

### Requirement: The quit prompt's whole frame

The quit prompt's whole frame SHALL differ from its reference by no more than 2 percent on average.

#### Scenario: A frame above 2 percent does not pass

- **GIVEN** the quit prompt's frame is compared against its reference
- **WHEN** its mean difference is above 2 percent
- **THEN** the frame does not pass

### Requirement: The reputation reward page

The reputation reward page SHALL be judged over its level list's panel against the global default difference bar.

#### Scenario: A reputation page above the bar still gets its image

- **GIVEN** the reward page's level list panel is compared against its frame
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the score is reported over the bar, and the page's image is still written

### Requirement: The menu and the World Level dialog

The menu and the World Level dialog SHALL be compared over whole frames once a whole-frame reference or a recording of them exists, and their images written by approve.

#### Scenario: Without a whole-frame reference the menu's score waits

- **GIVEN** the only still of the menu covers one region of it
- **WHEN** its score is considered
- **THEN** the score waits for a whole-frame reference

#### Scenario: Without a recording the World Level dialog's score waits

- **GIVEN** no recording of the World Level dialog is on disk
- **WHEN** its score is considered
- **THEN** the score waits for the recording
