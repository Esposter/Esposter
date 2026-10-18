## Purpose

How a successful mutation becomes achievement progress, an unlock, and a live toast. Progress is recorded after the mutation succeeds, and only for achievements whose trigger and condition match its input.

## Requirements

### Requirement: Successful mutations advance matching achievements

The platform SHALL advance the progress of each achievement whose trigger matches a mutation that succeeded.

#### Scenario: A successful action advances its achievement

- **GIVEN** an achievement is triggered by sending a message
- **WHEN** a signed-in user sends a message successfully
- **THEN** that user's progress toward the achievement increases

### Requirement: Failed mutations never advance progress

The platform SHALL NOT advance any achievement's progress for a mutation that failed.

#### Scenario: A rejected action leaves progress unchanged

- **GIVEN** an achievement is triggered by sending a message
- **WHEN** a signed-in user's attempt to send a message fails
- **THEN** no achievement's progress changes

### Requirement: Progress counts only input that satisfies the trigger

The platform SHALL advance an achievement only when the mutation's input matches the achievement's trigger and its condition, when it has one, holds for that input.

#### Scenario: Input outside the trigger's shape

- **GIVEN** an achievement is triggered by sending a message
- **WHEN** a successful mutation on that path carries input that does not match the trigger's shape
- **THEN** the achievement's progress does not change

#### Scenario: Condition not met

- **GIVEN** an achievement has a condition that the input does not satisfy
- **WHEN** a successful mutation on its trigger path carries input that matches the trigger's shape
- **THEN** the achievement's progress does not change

### Requirement: Reaching the threshold unlocks an achievement

The platform SHALL unlock an achievement for a user when that user's progress reaches the achievement's threshold.

#### Scenario: Progress reaches the threshold

- **GIVEN** a user's progress toward an achievement is one step below its threshold
- **WHEN** a qualifying mutation succeeds for that user
- **THEN** the achievement is unlocked for that user with an unlock time

### Requirement: An unlock is never repeated or changed

The platform SHALL leave an unlocked achievement's progress and unlock time unchanged by any later qualifying mutation.

#### Scenario: Qualifying action after an unlock

- **GIVEN** a user has already unlocked an achievement
- **WHEN** another qualifying mutation succeeds for that user
- **THEN** the achievement's progress and unlock time stay unchanged

### Requirement: Progress and unlock updates reach the signed-in user live

The app SHALL show a signed-in user each progress or unlock change to their own achievements as it happens, without a page reload.

#### Scenario: Toast on unlock anywhere in the app

- **GIVEN** a signed-in user is on any page of the app
- **WHEN** one of their achievements unlocks
- **THEN** a notification toast for the unlock appears without a reload

#### Scenario: Other users' changes are not shown

- **GIVEN** a signed-in user is on any page of the app
- **WHEN** another user's achievement changes
- **THEN** the signed-in user receives no update for it

### Requirement: Hidden achievements are masked in the gallery

The gallery SHALL show a hidden achievement's name and description as ??? in place of the real text.

#### Scenario: Hidden achievement in the gallery

- **GIVEN** an achievement is marked hidden
- **WHEN** a visitor views the achievements gallery
- **THEN** that achievement's name and description both show as ???

### Requirement: A user's progress is readable by any caller

The platform SHALL return a requested user's full achievement progress, hidden achievements included, to any caller who asks for it.

#### Scenario: Another user's progress, hidden unlocks included

- **GIVEN** another user has unlocked a hidden achievement
- **WHEN** a caller requests that user's achievement progress
- **THEN** the full list is returned, including the hidden unlock

#### Scenario: No user named in the request

- **GIVEN** a caller requests achievement progress without naming a user
- **WHEN** the request is processed
- **THEN** the caller's own achievement progress is returned

### Requirement: Time-of-day conditions use the sender's time zone

The platform SHALL judge a time-of-day condition by the hour in the time zone the sender's call carries, never the server's time zone.

#### Scenario: Early-bird window in the sender's zone

- **GIVEN** a user in Sydney sends a message at six in the morning local time
- **WHEN** the send succeeds
- **THEN** the early-bird time-of-day condition holds for that send

### Requirement: A failure in achievement processing does not fail the user's action

The platform SHALL NOT fail the user's mutation when recording its achievement progress fails.

#### Scenario: Failure recorded after the action succeeds

- **GIVEN** recording achievement progress fails for a successful mutation
- **WHEN** the user's mutation completes
- **THEN** the user's action is still successful
- **AND** the failure is logged with the path, user and achievement name involved
