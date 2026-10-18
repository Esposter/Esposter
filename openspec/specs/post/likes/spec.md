## Purpose

The ±1 like model, transactional counter and ranking updates, and the optimistic client stores. A signed-in user holds one up or down vote per post, and every copy of the post on screen reflects that vote at once.

## Requirements

### Requirement: Each user holds at most one vote per post

A signed-in user SHALL hold at most one vote on each post, either up or down.

#### Scenario: First vote raises the net count

- **GIVEN** a post with three net likes and a signed-in user who has not voted on it
- **WHEN** the user votes up
- **THEN** the post's net count becomes four

#### Scenario: Flipping a vote moves the count by two

- **GIVEN** a post with three net likes and a signed-in user who has voted up on it
- **WHEN** the user switches the vote to down
- **THEN** the post's net count becomes one

#### Scenario: Pressing the held vote again retracts it

- **GIVEN** a signed-in user who has voted up on a post
- **WHEN** the user presses the up arrow again
- **THEN** the vote is removed and the post's net count goes back by one

#### Scenario: Switching to the vote already held is refused

- **GIVEN** a signed-in user who has voted up on a post
- **WHEN** the user asks to switch the vote to up, which is the vote already held
- **THEN** the request is refused and the post's net count is unchanged

### Requirement: Only a vote of up or down is accepted

A vote SHALL be either up or down, and any other value SHALL be refused.

#### Scenario: A value other than up or down is refused

- **GIVEN** a signed-in user
- **WHEN** the user submits a vote with any value other than up or down
- **THEN** the vote is refused and nothing is recorded

### Requirement: Voting requires a signed-in user

Only a signed-in user SHALL be able to vote on a post.

#### Scenario: An anonymous reader cannot vote

- **GIVEN** a reader who is not signed in
- **WHEN** the reader tries to vote on a post
- **THEN** the vote is refused

### Requirement: A vote updates the net count and ranking together or not at all

Each vote SHALL update the post's net count and its ranking in one change, so that neither changes without the other.

#### Scenario: A failed vote leaves the count and ranking unchanged

- **GIVEN** a post with a known net count and ranking
- **WHEN** a vote on the post fails part way through
- **THEN** the net count and the ranking both stay at their previous values

### Requirement: Every post a reader receives shows only that reader's own vote

A post a reader receives SHALL carry only that reader's own vote and SHALL NOT list the votes of other users.

#### Scenario: A signed-in reader sees their own vote on a post

- **GIVEN** a post that the signed-in reader has voted on and that other users have also voted on
- **WHEN** the reader loads the post
- **THEN** the reader's own vote is shown as pressed
- **AND** the votes of other users are not included in what the reader receives
- **AND** the post shows its net count

#### Scenario: A reader who is not signed in sees no vote pressed

- **GIVEN** a reader who is not signed in
- **WHEN** the reader loads a post
- **THEN** neither arrow is pressed
- **AND** the post shows its net count

### Requirement: A vote shows at once on every copy of the post on screen

A vote SHALL appear immediately on every copy of the post the reader is looking at, whichever list or page the copy came from.

#### Scenario: A vote on a post page shows on its feed card

- **GIVEN** a post shown both in the feed and on its own page
- **WHEN** the reader votes on the post from its own page
- **THEN** the feed card for the same post shows the same vote and net count without a reload

#### Scenario: A refused vote reverts every copy on screen

- **GIVEN** a post shown in more than one place with a vote applied to all of them
- **WHEN** the server refuses that vote
- **THEN** every copy of the post returns to the vote and net count it showed before

### Requirement: Votes count toward like achievements

Votes SHALL count toward like achievements in the same way as any other achievement trigger.

#### Scenario: A vote that an achievement counts advances that achievement

- **GIVEN** a signed-in user working toward a like achievement
- **WHEN** the user casts a vote that the achievement counts
- **THEN** the achievement's progress advances
