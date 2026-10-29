# user/account-deletion Specification

## Purpose

The Delete account card in user settings — a typed confirmation that signs the person out everywhere and starts a sweep, which removes the account and the content it owns from every store keyed to it, and deletes the account's row last so an unfinished sweep is retried.

## Requirements

### Requirement: Deleting the account signs it out everywhere at once

Deleting the account SHALL mark the account as pending deletion, publish the deletion, and then end every session it holds before the request returns. A deletion that cannot be published SHALL fail the request and SHALL leave the sessions open.

#### Scenario: The deletion ends the caller's sessions

- **GIVEN** a signed-in person with two open sessions
- **WHEN** they confirm the deletion of their account
- **THEN** both sessions are ended and the request returns without waiting for the sweep

#### Scenario: A deletion that cannot be published leaves the person signed in

- **GIVEN** a signed-in person with two open sessions
- **WHEN** they confirm the deletion of their account and the deletion cannot be published
- **THEN** the request fails with the error, both sessions remain open, and the person can confirm the deletion again

### Requirement: Deletion requires a typed confirmation

The settings page SHALL start the deletion only after the person types their own display name into a confirmation, and SHALL not offer the deletion to anyone signed out.

#### Scenario: A deletion is not started by a click alone

- **GIVEN** a signed-in person on the settings page
- **WHEN** they press Delete account and do not type their display name
- **THEN** no deletion is requested

### Requirement: The sweep removes every user-keyed store and the user row last

The deletion SHALL remove each store the user data inventory lists as keyed to the account, and SHALL delete the account's row last, so that a sweep which has not finished leaves the row to be retried.

#### Scenario: A failed sweep leaves the account to be retried

- **GIVEN** a pending deletion whose blob sweep fails partway
- **WHEN** the sweep is redelivered
- **THEN** the account row still exists, the already-removed stores are unchanged, and the redelivery finishes the sweep

#### Scenario: A finished sweep leaves no row and no owned content

- **GIVEN** a pending deletion whose sweep has completed
- **WHEN** the account's rows are read
- **THEN** no user row, session, account or push subscription exists for it

### Requirement: Owned rooms are deleted as an owner's departure deletes them

A room whose owner is the account being deleted SHALL be deleted for every member, with its message partitions, its moderation records and its attachments, as leaving the room as its owner already deletes it.

#### Scenario: A deleted owner's room is removed with its messages and files

- **GIVEN** a room owned by the account, with messages and an attachment
- **WHEN** the deletion sweeps
- **THEN** the room, its message partitions and its attachments are gone

### Requirement: The account's messages and charged attachments are removed from the rooms it is in

The deletion SHALL soft-delete every message the account wrote in a room it is a member of, and SHALL remove every attachment the account is charged for, found through its storage ledger rows.

#### Scenario: A member's messages are removed from the rooms they are in

- **GIVEN** an account that wrote messages in two rooms it is still a member of
- **WHEN** the deletion sweeps
- **THEN** those messages are soft-deleted in both rooms and no other person's messages change

#### Scenario: Charged attachments are removed through the ledger

- **GIVEN** an account charged for two uploaded files
- **WHEN** the deletion sweeps
- **THEN** both files are removed and their ledger rows are gone

### Requirement: Resources the account owns are purged

Each resource the account owns SHALL be purged as the resource purge already purges it, including its directory, its table partitions and its ledger rows.

#### Scenario: An owned resource is purged

- **GIVEN** a resource the account owns with a working copy and a version
- **WHEN** the deletion sweeps
- **THEN** the resource's directory, its partitions and its row are gone

### Requirement: The account's own blob directories are removed by prefix

The deletion SHALL remove every blob under the account's prefix in the public and private asset containers and in the game-save containers.

#### Scenario: A profile image and a save are removed

- **GIVEN** an account with a profile image and a game save
- **WHEN** the deletion sweeps
- **THEN** the profile image and the save are gone

### Requirement: The deletion states what it does not remove

The deletion SHALL NOT remove moderation records in other people's rooms that name the account, or resource activity records on resources the account does not own, and the settings page SHALL say so before the person confirms.

#### Scenario: The confirmation names what is kept

- **GIVEN** a signed-in person about to delete their account
- **WHEN** the confirmation opens
- **THEN** it says that moderation records in other people's rooms that name the person, and activity on other people's resources are kept

### Requirement: The accounts foreign key cascades on the user row

The account's OAuth and credential rows SHALL be removed with the user row, so that the user row can be deleted at all.

#### Scenario: Deleting the user row removes its sign-in accounts

- **GIVEN** a user row with two linked sign-in accounts
- **WHEN** the row is deleted
- **THEN** both account rows are gone
