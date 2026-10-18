## Purpose

Posts and comments from users the viewer has blocked are hidden from feeds. Blocking filters only the feeds and comment lists a viewer reads, and leaves every count and any post opened directly unchanged.

## Requirements

### Requirement: Blocked users' posts are hidden from the feed

The home feed SHALL omit every post written by a user the signed-in viewer has blocked.

#### Scenario: Feed omits a blocked author's post

- **GIVEN** a signed-in viewer who has blocked another user
- **WHEN** the viewer loads the home feed
- **THEN** no post written by the blocked user appears in the feed
- **AND** posts by users the viewer has not blocked still appear

### Requirement: Blocked users' comments are hidden from threads

A comment thread SHALL omit every comment written by a user the signed-in viewer has blocked.

#### Scenario: Thread omits a blocked author's comment

- **GIVEN** a signed-in viewer who has blocked a user who commented on a post
- **WHEN** the viewer opens that post's comment thread
- **THEN** no comment written by the blocked user appears in the thread
- **AND** comments by users the viewer has not blocked still appear

### Requirement: A blocked user's post stays readable by direct link

Opening a post directly SHALL show the post even when its author is blocked by the viewer.

#### Scenario: Direct link opens a blocked author's post

- **GIVEN** a signed-in viewer who has blocked the author of a post
- **WHEN** the viewer opens that post by its direct address
- **THEN** the post is shown in full

### Requirement: Block filtering applies only to signed-in viewers

Block filtering SHALL apply only when the reader is signed in, since a reader who is not signed in has no block list.

#### Scenario: Anonymous reader sees posts from every author

- **GIVEN** a reader who is not signed in
- **WHEN** the reader loads the home feed
- **THEN** posts from every author appear without any filtering

### Requirement: Hidden content leaves no trace in the feed

A hidden post or comment SHALL leave no placeholder or notice in the place it would have occupied.

#### Scenario: Feed shows no notice for a hidden post

- **GIVEN** a signed-in viewer who has blocked an author with posts in the feed
- **WHEN** the viewer scrolls through the feed
- **THEN** the feed shows no placeholder where the blocked author's posts would have been
- **AND** the feed shows no notice that any content was hidden

### Requirement: Blocking leaves vote and comment counts unchanged

Blocking SHALL NOT change the like or comment totals shown on any post, including votes and comments from the blocked user.

#### Scenario: Totals include a blocked user's activity

- **GIVEN** a post that a blocked user has liked and commented on
- **WHEN** the signed-in viewer sees that post in the feed
- **THEN** its like total and comment total include the blocked user's activity
