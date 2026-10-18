## ADDED Requirements

### Requirement: A client shows its own publisher's logo where it differs

The publisher splash SHALL show the logo of the publisher a client shows, for each client whose recording shows a different publisher's logo.

#### Scenario: A client with a different publisher shows its own logo

- **GIVEN** the reader's game language is one whose client shows a different publisher's logo
- **WHEN** the opening reaches its publisher splash
- **THEN** the splash shows that client's publisher logo

### Requirement: A language's screen layout differs only where its recording differs

A language's opening screen SHALL use the English layout unless that language's own recording shows a different layout for that screen.

#### Scenario: A language without a differing recording uses the English layout

- **GIVEN** the reader's game language has no recording showing a different layout for a screen
- **WHEN** the opening shows that screen
- **THEN** the screen uses the English layout

#### Scenario: A language whose recording differs uses its own layout

- **GIVEN** the reader's game language has a recording showing a different layout for a screen
- **WHEN** the opening shows that screen
- **THEN** the screen uses that language's layout

### Requirement: The visual suite holds an image only for a language that differs

The visual suite SHALL hold an image for a language's screen only when that language's screen differs from the English one.

#### Scenario: The visual suite gains an image for a differing language

- **GIVEN** a language's screen differs from the English layout
- **WHEN** the visual suite is run
- **THEN** the suite holds an image of that language's screen

#### Scenario: The visual suite gains no image for a language that matches English

- **GIVEN** a language's screen matches the English layout
- **WHEN** the visual suite is run
- **THEN** the suite holds no image of that language's screen

### Requirement: A localized reference is compared in its client's words

A reference naming a language SHALL be compared with that language's game text loaded for its screen.

#### Scenario: The mainland health notice is compared in its own words

- **GIVEN** the reference of the mainland health notice names the Chinese language
- **WHEN** the reference is compared
- **THEN** the screen is shown with the Chinese game text
- **AND** the comparison is made against the reference in that text
