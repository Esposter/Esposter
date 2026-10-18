## Purpose

Room invite links — one 8-char token per member per room, with Discord's expiry and max-use options.

## Requirements

### Requirement: A member has one invite link per room, replaced when they create a new one

A member SHALL have at most one invite link per room, and creating a link with new options SHALL replace the link they already had.

#### Scenario: Creating a link

- **GIVEN** a member with permission to create invites
- **WHEN** they create an invite link for a room
- **THEN** the link is shown with its expiry and remaining uses

#### Scenario: Changing options replaces the link

- **GIVEN** a member has a live invite link for a room
- **WHEN** they change its expiry or maximum uses
- **THEN** a new link replaces the old one

### Requirement: An invite link can expire or allow a limited number of uses

An invite link SHALL offer expiry after 30 minutes up to 7 days or never, and a maximum of 1 to 100 uses or unlimited uses.

#### Scenario: Link that never expires

- **GIVEN** a member chooses never to expire
- **WHEN** the link is created
- **THEN** the link has no expiry

#### Scenario: Unlimited uses

- **GIVEN** a member chooses unlimited uses
- **WHEN** the link is created
- **THEN** anyone with the link can join while it is unexpired

#### Scenario: Use limit outside the offered options is refused

- **GIVEN** a caller asks for a use limit that is not one of the offered options
- **WHEN** they create the link
- **THEN** the request is refused

### Requirement: Joining with a link succeeds only while it is unexpired and has uses left

Joining with an invite link SHALL succeed only while the link is unexpired and under its use limit, and each successful join SHALL use one of its remaining uses.

#### Scenario: Joining with a valid link

- **GIVEN** a live invite link with uses remaining
- **WHEN** a user joins through it
- **THEN** the user joins the room
- **AND** one use is consumed

#### Scenario: Expired link

- **GIVEN** an invite link whose expiry has passed
- **WHEN** a user tries to join through it
- **THEN** the join is refused

#### Scenario: Exhausted link

- **GIVEN** an invite link whose uses have all been consumed
- **WHEN** a user tries to join through it
- **THEN** the join is refused

#### Scenario: Two joins race for the last use

- **GIVEN** an invite link has one use remaining
- **WHEN** two users join through it at the same moment
- **THEN** only one of them joins

#### Scenario: Banned user cannot join through a link

- **GIVEN** a user is banned from a room
- **WHEN** they try to join through a live link
- **THEN** the join is refused

### Requirement: Every refused join reports the same not-found result

A refused join SHALL report the same not-found result whatever the reason, so that it reveals nothing about why the link failed.

#### Scenario: Unknown, expired, exhausted and paused links look the same

- **GIVEN** a link that is unknown, expired, used up, or belongs to a paused room
- **WHEN** a user tries to join through it
- **THEN** each attempt shows the same not-found result

### Requirement: A room manager can pause all invite links at once

A member with permission to manage the room SHALL be able to pause invites for the room, closing every link without deleting any of them, and SHALL be able to resume them later.

#### Scenario: Paused room refuses every link

- **GIVEN** a room's invites are paused
- **WHEN** a user joins through any existing link
- **THEN** the join is refused as not found

#### Scenario: Pausing costs a link nothing

- **GIVEN** a link has uses remaining
- **WHEN** a join through it is attempted while invites are paused
- **THEN** the link keeps its remaining uses

#### Scenario: No new link while paused

- **GIVEN** a room's invites are paused
- **WHEN** a member tries to create an invite link
- **THEN** the creation is refused

#### Scenario: Resuming restores existing links

- **GIVEN** a room's invites are paused
- **WHEN** a manager resumes invites
- **THEN** the existing links work again while they are still unexpired and have uses left

### Requirement: Revoking a link stops it working immediately

An invite link SHALL stop working as soon as its creator or a member with permission to manage the room revokes it.

#### Scenario: Creator revokes their own link

- **GIVEN** a member has a live invite link
- **WHEN** they revoke it
- **THEN** joining through it is refused

#### Scenario: Manager revokes another member's link

- **GIVEN** a member has a live invite link
- **WHEN** a manager revokes it from the room settings
- **THEN** joining through it is refused

#### Scenario: Member cannot revoke someone else's link

- **GIVEN** a member without permission to manage the room
- **WHEN** they try to revoke another member's link
- **THEN** the revocation is refused

### Requirement: Creating an invite requires the invite permission

Creating an invite link SHALL require permission to manage invites, which members hold by default.

#### Scenario: Default member can create an invite

- **GIVEN** a member with the default permissions of a room
- **WHEN** they create an invite link
- **THEN** the link is created

#### Scenario: Member without the permission cannot create an invite

- **GIVEN** a member who has been denied the invite permission
- **WHEN** they try to create an invite link
- **THEN** the creation is refused

### Requirement: The room settings list every live link and what each allows

The room settings panel SHALL list every live invite link in the room with its creator, uses, expiry and a revoke action, and opening the panel SHALL NOT create a link.

#### Scenario: Listing the room's links

- **GIVEN** a room has several live invite links
- **WHEN** a manager opens the Invites panel in room settings
- **THEN** each live link is listed with its creator, uses so far against the limit, and its expiry counting down
- **AND** each link has a revoke action

#### Scenario: Empty panel

- **GIVEN** a room has no live invite links
- **WHEN** a manager opens the Invites panel
- **THEN** the panel shows an empty state

#### Scenario: Opening the panel creates nothing

- **GIVEN** a room has no live invite link
- **WHEN** a manager opens the Invites panel
- **THEN** no invite link is created

### Requirement: Expired and used-up links are never offered as usable

Expired and used-up invite links SHALL NOT be shown as usable in the room's list or on the invite landing page.

#### Scenario: Landing page for an expired link

- **GIVEN** an invite link has expired
- **WHEN** someone opens its address
- **THEN** the page shows no room to join

#### Scenario: Expired link is absent from the room's list

- **GIVEN** a room has an expired invite link
- **WHEN** a manager opens the Invites panel
- **THEN** the expired link is not listed

### Requirement: The invite dialog hands over a usable link and sends it to friends

The invite dialog SHALL show a usable invite link when it opens, SHALL list the sender's friends and group direct messages, and SHALL send the link into a chosen friend's or group's direct message.

#### Scenario: Opening the dialog shows a link

- **GIVEN** a member opens the invite dialog for a room
- **WHEN** the dialog is shown
- **THEN** a usable link is shown
- **AND** an existing live link is shown rather than replaced

#### Scenario: Inviting a friend

- **GIVEN** the invite dialog is open with a usable link
- **WHEN** the sender presses Invite beside a friend
- **THEN** the link is sent into that friend's direct message as the sender's message
- **AND** the dialog stays open

#### Scenario: Friend already in the room

- **GIVEN** a friend is already a member of the room
- **WHEN** the invite dialog lists friends
- **THEN** that friend's entry shows Joined and cannot be invited

#### Scenario: Inviting into a group direct message

- **GIVEN** the sender is in a group direct message
- **WHEN** they press Invite beside it
- **THEN** the link is sent into that group

#### Scenario: No usable link disables invites

- **GIVEN** the room's invites are paused or no link exists
- **WHEN** the invite dialog is shown
- **THEN** every Invite action is disabled

### Requirement: An expired link is replaced when a friend is invited with it

When a friend is invited through a link that has expired or run out of uses while the dialog stayed open, the link SHALL be replaced before it is sent.

#### Scenario: Link expired while the dialog was open

- **GIVEN** the invite dialog has been open long enough for its link to expire
- **WHEN** the sender presses Invite beside a friend
- **THEN** a fresh link is created first
- **AND** the fresh link is what is sent to the friend

### Requirement: A friend's menu sends a room's link to that friend

A reader SHALL be able to send a room's invite link to a friend from the friend's menu, choosing among the rooms they may invite into.

#### Scenario: Choosing a room from the friend's menu

- **GIVEN** the reader may invite into several rooms
- **WHEN** they choose Invite to room from a friend's menu
- **THEN** only rooms where they may create invites and whose invites are not paused are listed
- **AND** choosing one sends that room's link to the friend

#### Scenario: Live link is not replaced by a friend's pick

- **GIVEN** the chosen room already has a live link
- **WHEN** the reader sends it to a friend from the friend's menu
- **THEN** the existing live link is sent

### Requirement: Direct message conversations never accept invite links

Direct message conversations SHALL NOT be joined through invite links.

#### Scenario: Invite to a direct message is not offered

- **GIVEN** the reader is viewing a direct message
- **WHEN** they look for an invite option
- **THEN** no invite is offered for that conversation
