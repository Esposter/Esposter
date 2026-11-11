## ADDED Requirements

### Requirement: The status tells a participant who has started from one who has not

The program's status SHALL show each participant as not started, started or finished, where started means the survey holds a saved draft for their token and no submitted response.

#### Scenario: A participant with a draft and no response is started

- **GIVEN** a participant whose token matches a saved draft and no submitted response
- **WHEN** the owner reads the status
- **THEN** the participant is started

#### Scenario: A submitted response wins over a draft

- **GIVEN** a participant whose token matches a submitted response and an earlier draft
- **WHEN** the owner reads the status
- **THEN** the participant is finished and not started

#### Scenario: The Status blade shows who has started

- **GIVEN** a program with one participant not started, one started and one finished
- **WHEN** the owner opens the Status blade
- **THEN** each participant is shown in their own state
- **AND** the meter counts only the finished one as responded

#### Scenario: The dataset carries started and no identifier

- **GIVEN** a program whose status is read through the `ProgramStatus` dataset
- **WHEN** a dashboard reads its rows
- **THEN** each row has a started flag beside the responded flag
- **AND** no row carries the key value or the token
