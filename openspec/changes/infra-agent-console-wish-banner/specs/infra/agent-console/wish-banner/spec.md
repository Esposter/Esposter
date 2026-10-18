## ADDED Requirements

### Requirement: The lore draw weighs the characters met in recent sessions

The lore draw SHALL take the characters met in recent sessions into account when it draws a character for a new session.

#### Scenario: A recent pick is read by the next draw

- **GIVEN** a session drew a character
- **WHEN** a new session starts and draws a character
- **THEN** the draw takes the earlier session's character into account

### Requirement: A lore-drawn session opens with a falling star

The console SHALL show a star falling and resolving into the character's nameplate when a session drawn by lore opens in the Genshin theme.

#### Scenario: A four-star pick falls in purple

- **GIVEN** lore drew a four-star character for the session
- **WHEN** the session opens in the Genshin theme
- **THEN** a purple star falls
- **AND** the star resolves into the character's nameplate

#### Scenario: A five-star pick falls in gold

- **GIVEN** lore drew a five-star character for the session
- **WHEN** the session opens in the Genshin theme
- **THEN** a gold star falls
- **AND** the star resolves into the character's nameplate

#### Scenario: A pinned character appears without the fall

- **GIVEN** the session's character is pinned
- **WHEN** the session opens in the Genshin theme
- **THEN** the nameplate appears without a falling star

### Requirement: The rates panel lists the probability of every character

The console SHALL show, in the banner's details, every character with the probability the draw gave that character.

#### Scenario: The rates panel lists each character's probability

- **GIVEN** the banner's details are open
- **WHEN** the reader views the rates panel
- **THEN** every character in the draw is listed
- **AND** each character shows the probability the draw gave it
