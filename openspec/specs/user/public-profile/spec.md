## Purpose

A public /user/[id] page showing a user's identity, achievements, and posts. It is a page any visitor can open from an author's name, with no sign-in needed.

## Requirements

### Requirement: The profile page is open to signed-out visitors

The profile page SHALL show a user's identity, achievements and posts to a visitor who is not signed in.

#### Scenario: A signed-out visitor opens a profile

- **GIVEN** a visitor who is not signed in
- **WHEN** the visitor opens a user's profile page
- **THEN** the page shows the user's identity, achievements and posts

#### Scenario: A visitor over the rate limit is refused

- **GIVEN** a visitor who has made reads past the rate limit
- **WHEN** the visitor reads a profile again
- **THEN** the read is refused

### Requirement: A user is shown only with public fields wherever another user sees them

The profile identity SHALL show the name, avatar and biography of a user, and every surface that shows another user SHALL show the same public fields and never an email address.

#### Scenario: The profile header shows only public fields

- **GIVEN** a user with an email address and a biography
- **WHEN** a visitor opens the user's profile page
- **THEN** the header shows the name, avatar and biography
- **AND** the email address is not shown

#### Scenario: Another user shown on a post carries only public fields

- **GIVEN** a post written by a user
- **WHEN** a visitor views the post in a feed
- **THEN** the author is shown with the name and avatar only

### Requirement: The profile shows total points and the most recent unlocks

The profile SHALL show the total points a user has unlocked and the user's most recent achievement unlocks.

#### Scenario: Achievement points are shown for a user with unlocks

- **GIVEN** a user with unlocked achievements
- **WHEN** a visitor opens the user's profile page
- **THEN** the page shows the total points of those achievements
- **AND** the page shows the most recent unlocks

### Requirement: The profile lists only top-level posts by that author

The profile SHALL list only the top-level posts of its user, paginated by cursor, and SHALL NOT list comments.

#### Scenario: Comments are left off the profile

- **GIVEN** a user who has written both posts and comments
- **WHEN** a visitor opens the user's profile page
- **THEN** only the user's top-level posts are listed
- **AND** no comment is listed

#### Scenario: Scrolling loads the next page of posts

- **GIVEN** a profile whose posts run past the first page
- **WHEN** the visitor scrolls to the end of the list
- **THEN** the next page of posts is loaded

### Requirement: Blocking still hides a blocked author's posts on a profile

The profile SHALL hide a user's posts from a viewer who has blocked that user, while the user's identity remains reachable by direct navigation.

#### Scenario: A blocked author's profile hides posts but not identity

- **GIVEN** a viewer who has blocked a user
- **WHEN** the viewer opens the user's profile page by its address
- **THEN** the user's name is shown
- **AND** the user's posts are not listed

### Requirement: The profile shows no join date

The profile SHALL NOT show when the account was created.

#### Scenario: A profile header has no member-since line

- **GIVEN** any user
- **WHEN** a visitor opens the user's profile page
- **THEN** no member-since date is shown

### Requirement: An author's name on a post or comment opens the profile

The name and avatar of a post or comment author SHALL link to that user's profile page, and messaging surfaces SHALL keep their own member popovers instead.

#### Scenario: Clicking an author's name on a post opens the profile

- **GIVEN** a post in a feed
- **WHEN** a visitor clicks the author's name
- **THEN** the author's profile page opens

#### Scenario: Clicking a member in a messaging room keeps the room popover

- **GIVEN** a member listed in a messaging room
- **WHEN** a visitor clicks the member
- **THEN** the room's member popover opens instead of the profile page
