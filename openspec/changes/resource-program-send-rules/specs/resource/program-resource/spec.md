## ADDED Requirements

### Requirement: A program holds a rule that limits reminders

The owner SHALL be able to set a reminder rule on a program, the days that must pass since a person was last sent something and the most reminders one person receives, or leave it unset so reminders are not limited.

#### Scenario: A reminder rule is kept with the program

- **GIVEN** the owner opens Setup
- **WHEN** they set seven days and two reminders and save
- **THEN** the program keeps the rule and Setup shows it

#### Scenario: A reminder rule that allows nothing is refused

- **GIVEN** the program has a saved reminder rule
- **WHEN** the owner sets zero days or zero reminders and saves
- **THEN** the rule is refused
- **AND** the program keeps the rule it had

### Requirement: A dispatch lists who is due an invite or a reminder

The system SHALL list each audience person as due an invite when they were never invited, as due a reminder when they were invited, have not responded and the reminder rule allows one, and otherwise as due nothing.

#### Scenario: A person never invited is due an invite

- **GIVEN** an audience person who has never been sent anything
- **WHEN** the owner reads the dispatch
- **THEN** the person is due an invite

#### Scenario: A person who responded is due nothing

- **GIVEN** an invited person who has responded
- **WHEN** the owner reads the dispatch
- **THEN** the person is due neither an invite nor a reminder

#### Scenario: A reminder is due once the delay has passed

- **GIVEN** a rule of seven days and a person last sent something seven days ago who has not responded
- **WHEN** the owner reads the dispatch
- **THEN** the person is due a reminder

#### Scenario: A reminder is not due before the delay

- **GIVEN** a rule of seven days and a person last sent something three days ago who has not responded
- **WHEN** the owner reads the dispatch
- **THEN** the person is due nothing

#### Scenario: A person at the most reminders is due nothing

- **GIVEN** a rule of two reminders and a person who has had two and not responded
- **WHEN** the owner reads the dispatch
- **THEN** the person is due nothing

#### Scenario: Without a rule an invited person who has not responded is due a reminder

- **GIVEN** a program with no reminder rule and an invited person who has not responded
- **WHEN** the owner reads the dispatch
- **THEN** the person is due a reminder

### Requirement: Exporting a dispatch records who it covered

The export of invites or reminders SHALL record each person it includes as invited or reminded at that time, and SHALL record nothing when the export is refused.

#### Scenario: An invite export records the invitation

- **GIVEN** two people due an invite
- **WHEN** the owner exports invites
- **THEN** both are recorded as invited at that time
- **AND** neither is due an invite on the next dispatch

#### Scenario: A reminder export counts the reminder

- **GIVEN** a person due a reminder who has had one
- **WHEN** the owner exports reminders
- **THEN** the person is recorded as having had two

#### Scenario: A refused export records nothing

- **GIVEN** the bound email has no link to the bound survey
- **WHEN** the owner exports invites
- **THEN** the export is refused
- **AND** no person is recorded as invited

### Requirement: A dispatch gives every audience person a link first

The system SHALL give each distinct audience person one survey link when a dispatch is read or the links are downloaded, and SHALL NOT change a link already issued.

#### Scenario: A dispatch issues the links nobody has yet

- **GIVEN** an audience of three people, one already holding a link
- **WHEN** the owner reads the dispatch
- **THEN** the other two are given links

#### Scenario: A person keeps their link across dispatches

- **GIVEN** a person was given a link by an earlier dispatch and the audience has since grown
- **WHEN** the owner reads the dispatch again
- **THEN** the person's link is unchanged

#### Scenario: Two dispatches at once give one link per person

- **GIVEN** two dispatches are read at the same time for the same audience
- **WHEN** both finish
- **THEN** each person has one link only

#### Scenario: A dispatch without a bound survey is refused

- **GIVEN** the program has no survey bound
- **WHEN** the owner reads the dispatch
- **THEN** the dispatch is refused and no link is issued

#### Scenario: A dispatch is refused after the survey is deleted

- **GIVEN** the bound survey has been deleted
- **WHEN** the owner reads the dispatch
- **THEN** the dispatch is refused

### Requirement: Invites and reminders are exported for the people a dispatch lists

The owner SHALL be able to export invites for the people due an invite, or reminders for the people due a reminder, as a zip of one HTML file per person with merge fields filled and the survey link carrying that person's link.

#### Scenario: Exporting invites gives each person a filled file

- **GIVEN** the email's merge fields match the audience columns
- **WHEN** the owner exports invites
- **THEN** the zip holds one HTML file per person due an invite
- **AND** each file shows that person's audience values and their survey link

#### Scenario: Exporting reminders covers only those due one

- **GIVEN** some people have responded and some are not yet due a reminder
- **WHEN** the owner exports reminders
- **THEN** the zip holds files only for people due a reminder

#### Scenario: An email without a link to the survey is refused

- **GIVEN** the bound email has no link to the bound survey
- **WHEN** the owner exports invites
- **THEN** the export is refused before the audience is read

#### Scenario: An unbound part is refused before any read

- **GIVEN** the program has no key column bound
- **WHEN** the owner exports invites
- **THEN** the export is refused with the one message every unresolvable binding shares, which does not name the missing binding

#### Scenario: A person past the read limit is counted, not filled

- **GIVEN** the audience is longer than the read limit
- **WHEN** the owner exports invites
- **THEN** people beyond the limit are counted in a warning
- **AND** no file is produced with an unfilled merge field for them

### Requirement: The status view shows each person's dispatch facts and whether they responded

The status view SHALL list each person's key value, when they were added, when they were invited, how many reminders they have had and whether they responded, SHALL say how many are due an invite and a reminder, and SHALL NOT show any link.

#### Scenario: The status view lists people with their dispatch facts

- **GIVEN** some people have been invited and some have responded
- **WHEN** the owner opens Status
- **THEN** each person is listed with the date added, the date invited, the reminder count and whether they responded
- **AND** a meter shows the response rate so far

#### Scenario: The status view says how many are due

- **GIVEN** some people are due an invite and some a reminder
- **WHEN** the owner opens Status
- **THEN** the counts of each are shown beside their export buttons

#### Scenario: A draft answer does not count as responded

- **GIVEN** a person has started but not submitted a response
- **WHEN** the owner opens Status
- **THEN** that person is not shown as responded

#### Scenario: Status shows no links

- **GIVEN** the owner opens Status
- **WHEN** they look at the person rows
- **THEN** no person's survey link is shown

### Requirement: The status dataset shares no identities or links

The program's status dataset SHALL offer each person only as a public identifier, a date added, an invitation date, a reminder count and a response flag, and SHALL NOT include the key value or the survey link.

#### Scenario: A dashboard shows the funnel without identities

- **GIVEN** a dashboard visual is bound to the program's status
- **WHEN** the visual draws
- **THEN** it can show the response rate by invitation and reminder count
- **AND** the key values and links are not in its data

#### Scenario: A published dashboard publishes no key values

- **GIVEN** a dashboard bound to the program's status is published
- **WHEN** a viewer opens the public page
- **THEN** no key values or survey links are visible in its data

### Requirement: A deleted binding is named as missing and status stays readable

The Setup blade SHALL keep a binding whose email or survey was deleted, name it as missing and say how to rebind or restore it, and the Status blade SHALL still list the people.

#### Scenario: A deleted survey is named as missing

- **GIVEN** the bound survey has been deleted
- **WHEN** the owner opens Setup
- **THEN** the survey binding says it cannot be found
- **AND** says how to rebind or restore it

#### Scenario: Status stays readable after a survey is deleted

- **GIVEN** the bound survey has been deleted
- **WHEN** the owner opens Status
- **THEN** the people are still listed

## MODIFIED Requirements

### Requirement: The participant links file lists everyone in the program

The owner SHALL be able to download a file of every person's key value and survey link, which first gives a link to anyone in the audience who has none.

#### Scenario: The download includes earlier participants

- **GIVEN** people were given links by an earlier dispatch
- **WHEN** the owner downloads the links file
- **THEN** the file lists every person with their link

## REMOVED Requirements

### Requirement: Generating participants issues one link per person, without rotating existing ones

**Reason**: A dispatch gives every audience person a link when it is read, so the owner no longer generates participants as a step of their own.

**Migration**: The link-issuing guarantees (one link per person, no rotation, safe under concurrent reads) move to the requirement that a dispatch gives every audience person a link first.

### Requirement: Invites and reminders are exported as one personal file per person

**Reason**: The export covers the people a dispatch lists, due an invite or due a reminder, rather than everyone or everyone who has not responded.

**Migration**: Replaced by the requirement that invites and reminders are exported for the people a dispatch lists, with the same refusals and the same filled file.

### Requirement: The status view shows who has responded, without showing links

**Reason**: The status view also carries each person's dispatch facts and the counts due.

**Migration**: Replaced by the requirement that the status view shows each person's dispatch facts and whether they responded.

### Requirement: The response-rate dataset shares no identities or links

**Reason**: The dataset also carries the invitation date and the reminder count, so it is no longer only a response rate.

**Migration**: Replaced by the requirement that the status dataset shares no identities or links.

### Requirement: A deleted binding keeps its place and says how to fix it

**Reason**: Generating participants is gone, so its refusal after a survey is deleted is the dispatch's, and the status stays readable under the same requirement.

**Migration**: Replaced by the requirement that a deleted binding is named as missing and status stays readable, and by the dispatch refusal after the survey is deleted.
