## ADDED Requirements

### Requirement: A reference is a committed screenshot or wiki file

A reference SHALL be a committed screenshot of the game or a committed wiki file, and the repository SHALL NOT name a recording or a second of one as a reference, except in the reference's `source`, which names the recording and the second its screenshot was sampled from so a person can sample it again.

#### Scenario: Reference is a committed screenshot or wiki file

- **GIVEN** a reference a screen is judged against
- **WHEN** the reference is recorded in the manifest
- **THEN** it is a committed image whose object the manifest names, a labelled screenshot or a wiki file
- **AND** no recording or second of a recording is named as the reference's image

#### Scenario: Source names the recording and second it was sampled from

- **GIVEN** a reference whose screenshot was sampled from a recording
- **WHEN** the reference is recorded in the manifest
- **THEN** its `source` names the recording and the second the screenshot was sampled from
- **AND** the reference is still the committed screenshot

#### Scenario: Reference names a recording as its image

- **GIVEN** a reference entry that names a recording to read in place of a committed file
- **WHEN** the reference map is typechecked
- **THEN** typecheck fails and names the entry

### Requirement: A map edit never moves a committed reference silently

A map edit that would move a fixture variant's committed primary reference SHALL be refused, naming the one git mv that moves the file.

#### Scenario: A map edit that moves a committed reference is refused with its git mv

- **GIVEN** a fixture variant whose committed primary reference sits beside its snapshot
- **WHEN** a map edit adds a second whole-screen reference to that variant
- **THEN** the plan fails, names the git mv that moves the committed file to its flat path, and changes no file
