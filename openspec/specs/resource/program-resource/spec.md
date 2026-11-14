## Purpose

The distribution orchestrator — a resource binding an audience dataset, an email, and a survey; issuing opaque participant links, stored only as their hashes; and serving the joined funnel status as a dataset. The platform issues the links and the invites, but sends nothing itself.

## Requirements

### Requirement: A program binds an audience, an email and a survey

The owner SHALL be able to set a program's audience, its key column, its email and its survey in the Setup blade.

#### Scenario: Setting the bindings

- **GIVEN** the owner has a sheet of people, an email and a survey
- **WHEN** they choose each in the Setup blade and name the key column
- **THEN** the program is bound to all three

#### Scenario: A program has no editor

- **GIVEN** the owner opens a program
- **WHEN** they look at its blades
- **THEN** only Overview, Setup and Status are offered

### Requirement: Generating participants issues one link per person, without rotating existing ones

The owner SHALL be able to generate participants, which gives each distinct audience person one survey link, and SHALL NOT change a link that was already issued. A link is shown once, in the answer that issues it, and is stored only as its hash, so no read gives it back; the owner gets a new one by regenerating it.

#### Scenario: Each person gets one link

- **GIVEN** the audience has three distinct key values
- **WHEN** the owner generates participants
- **THEN** three participants are created, each with a survey link

#### Scenario: Regenerating after the audience grows keeps existing links

- **GIVEN** participants were generated and the audience later gains two people
- **WHEN** the owner generates participants again
- **THEN** two new participants are added
- **AND** the existing participants keep their links, and the answer carries the two new links only

#### Scenario: Generating without a bound survey is refused

- **GIVEN** the program has no survey bound
- **WHEN** the owner tries to generate participants
- **THEN** generation is refused and nothing is created

#### Scenario: A person already holding a link is not given a second one

- **GIVEN** two generations run at the same time for the same audience
- **WHEN** both finish
- **THEN** each person has one link only

### Requirement: The participant links file lists the links a run issued

The owner SHALL be able to download a file of the key value and survey link of each participant a generate run issued, and a run that issues none SHALL download nothing.

#### Scenario: A repeat run downloads nothing

- **GIVEN** participants were generated in an earlier run and the audience has not grown
- **WHEN** the owner generates participants again
- **THEN** no participant is issued a link
- **AND** no file is downloaded

#### Scenario: The file lists only the links that run issued

- **GIVEN** the audience gained two people since the earlier run
- **WHEN** the owner generates participants again
- **THEN** the file lists those two participants with their new links
- **AND** no earlier participant's link appears in it

### Requirement: A participant's link is regenerated, retiring the one they held

The owner SHALL be able to regenerate one participant's link. The link it replaces SHALL stop naming that participant, and the answers given under it SHALL stay with the participant.

#### Scenario: A regenerated link replaces the one held

- **GIVEN** a participant holds a link
- **WHEN** the owner regenerates their link
- **THEN** the new link is shown once, in the answer to that regeneration
- **AND** the link they held no longer names their participant

#### Scenario: A response given under the old link still counts

- **GIVEN** a participant responded through their link before it was regenerated
- **WHEN** the owner opens Status
- **THEN** that participant is still shown as responded

### Requirement: Invites and reminders are exported as one personal file per person

The owner SHALL be able to export invites for everyone, or reminders for those who have not yet responded, as a zip of one HTML file per person with merge fields filled and the survey link carrying a new link issued for that person, which retires the one already sent.

#### Scenario: Exporting invites gives each person a filled file

- **GIVEN** the email's merge fields match the audience columns
- **WHEN** the owner exports invites
- **THEN** the zip holds one HTML file per participant
- **AND** each file shows that participant's audience values and their new survey link

#### Scenario: Exporting reminders covers only those who have not responded

- **GIVEN** some participants have responded
- **WHEN** the owner exports reminders
- **THEN** the zip holds files only for participants who have not responded

#### Scenario: An email without a link to the survey is refused

- **GIVEN** the bound email has no link to the bound survey
- **WHEN** the owner exports invites
- **THEN** the export is refused before the audience is read

#### Scenario: An unbound part is named before any read

- **GIVEN** the program has no key column bound
- **WHEN** the owner exports invites
- **THEN** the export is refused with the one message every unresolvable binding shares, which does not name the missing binding

#### Scenario: A person past the read limit is counted, not filled

- **GIVEN** the audience is longer than the read limit
- **WHEN** the owner exports invites
- **THEN** people beyond the limit are counted in a warning
- **AND** no file is produced with an unfilled merge field for them

### Requirement: Key values in exported files cannot run as formulas

The participant links file and the invite files SHALL neutralise any key value that a spreadsheet would run as a formula.

#### Scenario: A key value starting with an equals sign is neutralised

- **GIVEN** an audience key value begins with an equals sign
- **WHEN** the owner downloads the participant links file
- **THEN** that cell opens as plain text

### Requirement: The status view shows who has responded, without showing links

The status view SHALL list each participant's key value, when they were added and whether they responded, and SHALL NOT show any participant's link. Each row offers a regenerate action for its participant's link instead.

#### Scenario: The status view lists participants with their response state

- **GIVEN** some participants have responded
- **WHEN** the owner opens Status
- **THEN** each participant is listed with the date added and whether they responded
- **AND** a meter shows the response rate so far

#### Scenario: A draft answer does not count as responded

- **GIVEN** a participant has started but not submitted a response
- **WHEN** the owner opens Status
- **THEN** that participant is not shown as responded

#### Scenario: Status shows no links

- **GIVEN** the owner opens Status
- **WHEN** they look at the participant rows
- **THEN** no participant's survey link is shown, and each row offers to regenerate it

### Requirement: A response through a participant's link is matched to that participant

The system SHALL match a survey response made through a participant's link to that participant, so that it counts as their response.

#### Scenario: A response through a link counts for its participant

- **GIVEN** a participant opens their survey link and submits a response
- **WHEN** the owner opens Status
- **THEN** that participant shows as responded

#### Scenario: A response with no matching link does not count

- **GIVEN** someone submits the survey with a link that matches no participant
- **WHEN** the owner opens Status
- **THEN** no participant is marked responded for it

### Requirement: The response-rate dataset shares no identities or links

The program's status dataset SHALL offer each participant only as a public identifier, a date and a response flag, and SHALL NOT include the key value or the survey link.

#### Scenario: A dashboard shows the response rate without identities

- **GIVEN** a dashboard visual is bound to the program's status
- **WHEN** the visual draws
- **THEN** it shows the response rate
- **AND** the key values and links are not in its data

#### Scenario: A published dashboard publishes no key values

- **GIVEN** a dashboard bound to the program's status is published
- **WHEN** a viewer opens the public page
- **THEN** no key values or survey links are visible in its data

### Requirement: An anonymous survey gets a warning that its links will not match

The Setup blade and the Status blade SHALL warn when the bound survey is anonymous, because its links cannot be matched to participants.

#### Scenario: Setup warns for an anonymous survey

- **GIVEN** the bound survey does not identify respondents
- **WHEN** the owner opens Setup
- **THEN** a warning explains that responses cannot be matched to participants

#### Scenario: Status keeps the warning while nothing has matched

- **GIVEN** the bound survey is anonymous and no response is matched
- **WHEN** the owner opens Status
- **THEN** the warning is shown

### Requirement: A deleted binding keeps its place and says how to fix it

The Setup blade SHALL keep a binding whose email or survey was deleted, name it as missing, and say how to rebind or restore it.

#### Scenario: A deleted survey is named as missing

- **GIVEN** the bound survey has been deleted
- **WHEN** the owner opens Setup
- **THEN** the survey binding says it cannot be found
- **AND** says how to rebind or restore it

#### Scenario: Status stays readable after a survey is deleted

- **GIVEN** the bound survey has been deleted
- **WHEN** the owner opens Status
- **THEN** the participants are still listed

#### Scenario: Generating participants is refused after the survey is deleted

- **GIVEN** the bound survey has been deleted
- **WHEN** the owner tries to generate participants
- **THEN** generation is refused

### Requirement: Restoring a program brings its participants back

The system SHALL keep a program's participants when it is moved to the recycle bin, and SHALL remove them only when the program is purged.

#### Scenario: A restored program still knows its participants

- **GIVEN** a program with participants is moved to the recycle bin and then restored
- **WHEN** the owner opens Status
- **THEN** the participants are still listed

#### Scenario: Purging a program removes its participants

- **GIVEN** a program is purged
- **WHEN** the purge completes
- **THEN** its participants are removed

### Requirement: A program keeps the reference to a deleted email

A program whose invite email is deleted SHALL keep its reference to that email and SHALL read the reference as missing.

#### Scenario: A program keeps its reference to a deleted email

- **GIVEN** a program whose invite is bound to an email that has been deleted
- **WHEN** the owner opens the program
- **THEN** the invite shows that its email is missing
