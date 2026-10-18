## Purpose

Inbound webhooks — an external system posts to a room's secret url and the message arrives under its own bot identity. Covers creating and rotating a webhook, how its url is accepted or refused, what a posted message looks like, and the limits on posting and creating.

## Requirements

### Requirement: A member with the webhook permission creates a webhook that posts under its own bot name

A member holding the manage webhooks permission SHALL be able to create a webhook for a room, and its messages SHALL appear under the webhook's own bot name.

#### Scenario: a manager creates a webhook

- **GIVEN** a member holding the manage webhooks permission
- **WHEN** the member chooses New Webhook in the room's settings
- **THEN** a webhook named by default is created
- **AND** the member can copy its full url

#### Scenario: a member renames a webhook

- **GIVEN** a webhook in the room's settings
- **WHEN** the manager renames it
- **THEN** its messages show the new name

#### Scenario: a member without the permission looks at webhooks

- **GIVEN** a member who does not hold the manage webhooks permission
- **WHEN** the member asks for the room's webhooks
- **THEN** the request is refused

### Requirement: A room holds at most one webhook

A room SHALL hold no more than one webhook at a time.

#### Scenario: a manager creates a second webhook

- **GIVEN** a room that already has a webhook
- **WHEN** a manager tries to create another
- **THEN** the creation is refused

### Requirement: Rotating a webhook's token invalidates the old url

Rotating a webhook's token SHALL give it a new url, and the old url SHALL stop accepting posts.

#### Scenario: a manager rotates a leaked url

- **GIVEN** a webhook whose url has leaked
- **WHEN** the manager rotates its token
- **THEN** a post to the old url is refused
- **AND** a post to the new url is accepted

### Requirement: A switched-off webhook refuses posts without revealing why

A webhook that is switched off or presented with a wrong token SHALL refuse the post with the same answer, not found.

#### Scenario: a post to a switched-off webhook

- **GIVEN** a webhook switched off by a manager
- **WHEN** an external system posts to its url
- **THEN** the post is answered as not found

#### Scenario: a post with a wrong token

- **GIVEN** a webhook's url with a token that does not match
- **WHEN** a post is sent to it
- **THEN** the post is answered as not found

### Requirement: A post is accepted only when it has text and no unsupported fields

A webhook post SHALL be accepted only when it includes text content and no field the webhook does not support.

#### Scenario: a post with no content

- **GIVEN** a post whose body has no content
- **WHEN** it is sent to a webhook
- **THEN** the post is refused as a bad request

#### Scenario: a post with an unsupported field

- **GIVEN** a post whose body includes embeds alongside its content
- **WHEN** it is sent to a webhook
- **THEN** the post is refused as a bad request

### Requirement: An accepted post is acknowledged at once and posted shortly after

An accepted webhook post SHALL be acknowledged immediately, and the message SHALL appear in the room after.

#### Scenario: a post with a name and avatar

- **GIVEN** a post that sets its own username and avatar
- **WHEN** it is accepted
- **THEN** the sender receives an accepted answer at once
- **AND** the message appears in the room under that username and avatar

### Requirement: A webhook may post only a limited number of times in a period

A webhook SHALL be limited in how many posts it may send in a period, and a post over that limit SHALL be refused as too many requests.

#### Scenario: a webhook sends posts too quickly

- **GIVEN** a webhook that has used its posting allowance for the period
- **WHEN** another post is sent to it
- **THEN** the post is refused as too many requests

### Requirement: Creating a webhook is limited more tightly than posting

Creating a webhook SHALL be limited to a slower rate than the other webhook changes.

#### Scenario: a manager creates webhooks repeatedly

- **GIVEN** a manager who has just created a webhook
- **WHEN** the manager tries to create webhooks again straight away
- **THEN** further creations are refused as too many requests

### Requirement: A webhook message appears as the bot, marked as an app

A message posted by a webhook SHALL show the bot's name and an app badge rather than a member's name.

#### Scenario: a reader views a webhook message

- **GIVEN** a message posted by a webhook
- **WHEN** a reader views the room
- **THEN** the message shows the bot's name with an app badge

### Requirement: Deleting a webhook stops its url from accepting posts

Deleting a webhook SHALL stop its url from accepting any further posts.

#### Scenario: a manager deletes a webhook

- **GIVEN** a webhook in the room
- **WHEN** a manager deletes it
- **THEN** a post to its url is refused as not found
