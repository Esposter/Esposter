# user/data-export Specification

## Purpose

A person can ask for a zip of everything their account holds, built in the background and fetched from their settings page. This capability covers the request, the one export a person has active at a time, and the archive's contents.

## Requirements

### Requirement: A data export is requested and built in the background

Requesting an export SHALL return once the request is recorded, and SHALL build the archive in the background rather than in the request.

#### Scenario: A request returns before the archive is built

- **GIVEN** a signed-in person with a large account
- **WHEN** they request an export
- **THEN** the request returns with the export queued, and the archive is built after it returns

### Requirement: One export is active per person

A request while an export is queued or building SHALL return that export, and SHALL NOT start another.

#### Scenario: A second request returns the first

- **GIVEN** a person whose export is building
- **WHEN** they request another export
- **THEN** the building export is returned and no second one is queued

### Requirement: The archive holds what the person's account holds

The archive SHALL hold the person's account record without secrets, their messages in rooms they are a member of with the files those messages attach, their owned resources, their game saves, their images and the moderation records that name them.

#### Scenario: The archive holds the person's own messages and not others'

- **GIVEN** a person who wrote one message and another person wrote one in the same room
- **WHEN** the archive is built
- **THEN** the archive holds the person's message and does not hold the other message

#### Scenario: The archive holds no secrets

- **GIVEN** a person with a linked sign-in provider and an open session
- **WHEN** the archive is built
- **THEN** the archive names the provider and holds no token and no session

### Requirement: A download link is short-lived and owner-only

A download link SHALL be issued only to the owner of a ready, unexpired export, and SHALL be valid for fifteen minutes.

#### Scenario: Another person cannot get the link

- **GIVEN** a ready export owned by one person
- **WHEN** a different person asks for its download link
- **THEN** no link is issued

#### Scenario: An expired export gives no link

- **GIVEN** a ready export whose expiry has passed
- **WHEN** its owner asks for the link
- **THEN** no link is issued and the export is shown as expired

### Requirement: The export states what it does not include

The settings page SHALL say that the archive omits other people's data and messages in rooms the person has left, before the request is made.

#### Scenario: The request names what is left out

- **GIVEN** a signed-in person on the settings page
- **WHEN** they open the export request
- **THEN** the request names the three omissions

### Requirement: A failed build is reported and not hidden

A build that fails SHALL mark its export failed with the reason, and SHALL NOT leave it looking ready.

#### Scenario: A failed build offers no link

- **GIVEN** an export whose build fails partway
- **WHEN** its owner checks its status
- **THEN** the status is failed, and no download link is issued
