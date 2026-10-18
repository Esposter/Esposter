## Purpose

Recording mode — while it is on, email addresses, money amounts, phone numbers and secret-shaped tokens show as placeholders in every message and tool result on screen while the model still reads the real values, and the model is asked to keep them out of its replies.

## Requirements

### Requirement: The screen shows placeholders for sensitive values while recording mode is on

While recording mode is on, every message and tool result on screen SHALL show a placeholder in place of each email address, money amount, phone number and secret-shaped token.

#### Scenario: An email address in a tool result

- **GIVEN** recording mode on and a tool result containing an email address
- **WHEN** the result is drawn on screen
- **THEN** the address shows as an email placeholder

#### Scenario: A secret-shaped token in a message

- **GIVEN** recording mode on and a message containing a token with a known key prefix
- **WHEN** the message is drawn on screen
- **THEN** the token shows as a secret placeholder

#### Scenario: A money amount in a message

- **GIVEN** recording mode on and a message containing a currency amount
- **WHEN** it is drawn on screen
- **THEN** the amount shows as an amount placeholder

### Requirement: The model keeps receiving the real values

The model SHALL keep receiving the real values, since only the drawing changes.

#### Scenario: The model reading a veiled tool result

- **GIVEN** recording mode on and a tool result containing a secret
- **WHEN** the model reads the result
- **THEN** it reads the real value

### Requirement: Values a pattern does not match stay visible

A version number, a date or a plain integer SHALL NOT be veiled as a phone number.

#### Scenario: A version number in a message

- **GIVEN** recording mode on and a message containing a version number
- **WHEN** it is drawn on screen
- **THEN** the version number is shown unchanged

### Requirement: Paths are never veiled

A file path SHALL NOT be veiled.

#### Scenario: A path in a tool result

- **GIVEN** recording mode on and a tool result containing a file path
- **WHEN** it is drawn on screen
- **THEN** the path is shown unchanged

### Requirement: The model is asked to keep sensitive values out of its replies

The system prompt SHALL ask the model to write placeholders for those kinds of values in its replies.

#### Scenario: The model writing a reply

- **GIVEN** recording mode on
- **WHEN** the model writes a reply
- **THEN** the system prompt has asked it to use placeholders for sensitive values

### Requirement: Veiling changes nothing the person types

Veil SHALL NOT change what the person types, though the transcript row hides it afterwards.

#### Scenario: A secret pasted into the prompt

- **GIVEN** recording mode on
- **WHEN** the person pastes a secret into the prompt
- **THEN** the secret is visible in the input before it is sent

### Requirement: Recording mode is switched on and off and marked while on

The veil on and off commands SHALL switch recording mode, which stays on across sessions until switched off, with a red marker shown while it is on.

#### Scenario: Turning recording mode on

- **GIVEN** recording mode off
- **WHEN** the person sends the on command
- **THEN** recording mode is on and a red marker heads the band

#### Scenario: Recording mode carried into a new session

- **GIVEN** recording mode on
- **WHEN** a new session starts
- **THEN** recording mode is still on

### Requirement: The secret pattern errs toward matching

The secret pattern SHALL lean toward matching, since an exposed key cannot be taken back.

#### Scenario: An ambiguous long mixed token

- **GIVEN** a long run of mixed letters and digits
- **WHEN** it is drawn on screen
- **THEN** it is veiled as a secret
