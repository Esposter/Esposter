## Purpose

A global ranking of users by their total unlocked achievement points, shown as a tab on the achievements page. Opting out of the ranking is out of scope.

## Requirements

### Requirement: Users are ranked by total unlocked points

The leaderboard SHALL rank every user with at least one unlocked achievement by the summed points of their unlocks, highest total first.

#### Scenario: Higher totals are listed first

- **GIVEN** two users have unlocked achievements worth 30 and 50 points in total
- **WHEN** a visitor opens the Leaderboard tab on the achievements page
- **THEN** the user with 50 points is listed above the user with 30 points

#### Scenario: Users without unlocks are left out

- **GIVEN** a user has no unlocked achievements
- **WHEN** a visitor opens the Leaderboard tab on the achievements page
- **THEN** that user does not appear in the ranking

### Requirement: Tied totals share a competition rank

The leaderboard SHALL give users with equal totals the same rank, and the rank after a tie SHALL skip past the tied positions.

#### Scenario: Tied users share a rank

- **GIVEN** two users have 40 points each and a third user has 20 points
- **WHEN** a visitor opens the Leaderboard tab on the achievements page
- **THEN** both tied users show rank 1
- **AND** the third user shows rank 3

### Requirement: The caller sees their own entry and global rank

The leaderboard SHALL show the signed-in caller's own entry with its global rank, even when that rank falls outside the displayed entries.

#### Scenario: Caller outside the displayed entries

- **GIVEN** the signed-in caller ranks below every entry the leaderboard displays
- **WHEN** the caller opens the Leaderboard tab on the achievements page
- **THEN** the caller's own row is appended below the displayed entries with its global rank
- **AND** the row is highlighted

#### Scenario: Caller already among the displayed entries

- **GIVEN** the signed-in caller ranks within the displayed entries
- **WHEN** the caller opens the Leaderboard tab on the achievements page
- **THEN** the caller's row is highlighted in place
- **AND** the caller's row is not repeated below the list

### Requirement: The leaderboard lists a bounded number of top users

The leaderboard SHALL list at most a fixed maximum number of top-ranked users.

#### Scenario: More users than the maximum

- **GIVEN** more users have unlocked achievements than the maximum number of entries
- **WHEN** a visitor opens the Leaderboard tab on the achievements page
- **THEN** only the top-ranked users up to the maximum are listed

#### Scenario: Fewer users than the maximum

- **GIVEN** fewer users have unlocked achievements than the maximum number of entries
- **WHEN** a visitor opens the Leaderboard tab on the achievements page
- **THEN** every ranked user is listed

### Requirement: Rows show only public profile fields

The leaderboard SHALL show each user's public name and avatar, never their email address, and each row SHALL link to that user's profile.

#### Scenario: Row shows public identity

- **GIVEN** a user is among the displayed entries
- **WHEN** the leaderboard renders
- **THEN** that user's row shows their rank, avatar, name and points
- **AND** the row links to that user's profile page

#### Scenario: Email address never shown

- **GIVEN** a user has an email address on record
- **WHEN** the leaderboard renders
- **THEN** that email address appears nowhere on the page

### Requirement: Hidden achievements count toward points

The leaderboard SHALL include the points of hidden achievements in a user's total.

#### Scenario: Hidden unlock adds to the total

- **GIVEN** a user's only unlocked achievement is hidden and worth 20 points
- **WHEN** a visitor opens the Leaderboard tab on the achievements page
- **THEN** that user's total shows 20 points

### Requirement: The leaderboard read is rate limited

The leaderboard read SHALL be rate limited, so requests beyond the allowance are refused.

#### Scenario: Requests beyond the allowance are refused

- **GIVEN** a caller has used up the leaderboard read's allowance
- **WHEN** the caller requests the leaderboard again
- **THEN** the request is refused

### Requirement: The leaderboard loads without blocking the achievements page

The leaderboard SHALL load in the background, so the gallery and the rest of the achievements page stay usable while it loads.

#### Scenario: Gallery usable while the leaderboard loads

- **GIVEN** the leaderboard is still loading
- **WHEN** a visitor switches to the Gallery tab on the achievements page
- **THEN** the gallery is shown and usable
