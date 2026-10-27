## ADDED Requirements

### Requirement: The sins switch is off until it is turned on

The sins mod SHALL be switched by its own command, off until it is switched on, and the choice SHALL hold for every later session.

#### Scenario: A fresh install

- **GIVEN** the plugin has never been switched on for sins
- **WHEN** a session starts
- **THEN** no sin is drawn and no prompt is scored

#### Scenario: Turning sins on

- **GIVEN** sins is off and a key is set
- **WHEN** the person sends the on command
- **THEN** the band line and the pane are available and later prompts are scored

#### Scenario: Turning sins off with the pane open

- **GIVEN** sins is on and the pane is open
- **WHEN** the person sends the off command
- **THEN** the pane says that sins is off and draws no bars

#### Scenario: A later session

- **GIVEN** sins was turned on in an earlier session
- **WHEN** a new session starts
- **THEN** sins is still on

### Requirement: Scoring needs a TypeSafe key, and the band and pane say so when it is missing

While no TypeSafe key is set in the session's environment, the sins mod SHALL record no evidence, and the band line and the pane SHALL say that a key is needed.

#### Scenario: Turning sins on without a key

- **GIVEN** no key is set
- **WHEN** the person sends the on command
- **THEN** the switch does not change and the reply says a key is needed

#### Scenario: A key removed before the next prompt

- **GIVEN** sins is on and the key has been removed since the last prompt
- **WHEN** the band or the pane is drawn
- **THEN** it says a key is needed, before any prompt is scored

#### Scenario: No key set

- **GIVEN** sins is on and no key is set
- **WHEN** the person sends a prompt
- **THEN** no evidence is recorded and the pane names the missing key

#### Scenario: A key set

- **GIVEN** sins is on and a key is set
- **WHEN** the person sends a prompt
- **THEN** the prompt is scored

### Requirement: Each prompt is scored by one call that covers all seven sins

When sins is on and a key is set, each prompt the person sends SHALL be scored by a single model call that answers for all seven sins together, and the session SHALL take the prompt without waiting for that call.

#### Scenario: One call per prompt

- **GIVEN** sins is on and a key is set
- **WHEN** the person sends a prompt
- **THEN** one call is made and it answers for all seven sins

#### Scenario: A slow answer

- **GIVEN** the scoring call takes several seconds
- **WHEN** the person sends a prompt
- **THEN** the session takes the prompt at once

### Requirement: A failed call records nothing and leaves the scores as they were

If the scoring call fails or answers nothing, the sins mod SHALL record no evidence for that prompt, and the band and pane SHALL keep the last settled scores.

#### Scenario: The call fails

- **GIVEN** the scoring call fails
- **WHEN** the answer is due
- **THEN** no evidence is recorded and the panel keeps its last settled scores

### Requirement: Prompts are redacted before they are sent

Before a prompt is sent to the model, the sins mod SHALL replace the personal and secret details the veil mod replaces, so that the model never receives those details.

#### Scenario: A prompt with an email address

- **GIVEN** a prompt containing an email address
- **WHEN** the prompt is scored
- **THEN** the call carries the veil placeholder in its place

### Requirement: Each sin's score follows recent prompts with a half-life of thirty prompts

Each sin's score SHALL be the discounted mean of its evidence with a half-life of thirty prompts, so that a change in the person's prompts moves the score about halfway toward the new pattern within thirty prompts.

#### Scenario: A pattern that changes

- **GIVEN** a sin has scored about 90% across many prompts
- **WHEN** the next thirty prompts score about 10%
- **THEN** the sin's score is about 50%

### Requirement: The pane draws one bar per sin with its spread

The pane SHALL draw each sin as one horizontal bar to its score, with a lighter extension to the score plus its spread, and the spread SHALL narrow as prompts accrue and hold at the width the half-life allows.

#### Scenario: A steady stream at fifty percent

- **GIVEN** a steady run of prompts scored at 50%
- **WHEN** the run has lasted well past the half-life
- **THEN** the spread is about seven and a half percentage points

#### Scenario: Seven sins drawn in a fixed order

- **GIVEN** sins is on and every sin has evidence
- **WHEN** the pane is drawn
- **THEN** seven bars are drawn in the same order every time

### Requirement: Every bar is named and valued

Each bar SHALL carry its sin's name and its score and spread as figures, so that a sin is identified without its colour.

#### Scenario: A bar in a colourless view

- **GIVEN** the pane is drawn without colour
- **WHEN** a bar is read
- **THEN** its name and its score are still shown

### Requirement: Each sin keeps its own colour

Each sin SHALL keep one colour in the pane, the same in light and dark mode and as its score moves.

#### Scenario: A score that moves

- **GIVEN** a sin whose score rises and falls over several prompts
- **WHEN** the pane is redrawn after each prompt
- **THEN** that sin's bar keeps the same colour

#### Scenario: Light and dark mode

- **GIVEN** the pane is drawn on a light surface and then on a dark one
- **WHEN** each is read
- **THEN** each sin has the same colour family on both

### Requirement: The pane shows each sin's trend over the last thirty prompts

The pane SHALL show, beside each bar, the score after each of the last thirty prompts as a trend.

#### Scenario: A trend after thirty prompts

- **GIVEN** a sin scored on at least thirty prompts
- **WHEN** the pane is drawn
- **THEN** the trend shows thirty points

### Requirement: The band shows one summary line and the pane opens from it

The band SHALL show one line of the seven scores, and a button SHALL open the pane.

#### Scenario: Pressing the open button

- **GIVEN** sins is on and the band is focused
- **WHEN** the person presses `p`
- **THEN** the pane opens

#### Scenario: A narrow surface

- **GIVEN** the surface is too narrow to dock the pane
- **WHEN** the pane opens
- **THEN** the pane is drawn inline above the prompt

### Requirement: A score not yet measured is left out

Before a sin has any evidence, the band and the pane SHALL leave that sin out rather than show zero.

#### Scenario: A fresh session

- **GIVEN** sins is on and no prompt has been scored yet
- **WHEN** the band and pane are drawn
- **THEN** no sin is shown with a score

### Requirement: The band and pane say why evidence cannot be stored

When the session's Node lacks node:sqlite, the band and pane SHALL say that Node 22.13 or later is needed, and SHALL record nothing.

#### Scenario: An older Node

- **GIVEN** sins is on and the session's Node is older than 22.13
- **WHEN** the band or pane is drawn
- **THEN** the view names the Node version needed and no evidence is recorded
