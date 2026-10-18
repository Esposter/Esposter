## Purpose

The home feed's cursor pagination, its sort, and the stored Reddit-style hot score. The feed lists top-level posts only, and comment threads keep their own order whatever sort the feed uses.

## Requirements

### Requirement: The feed loads in pages that continue from where the last page ended

The home feed SHALL load posts in pages, each page continuing exactly where the previous one ended.

#### Scenario: Reaching the end of the feed loads the next page

- **GIVEN** the feed has shown one page and more posts exist
- **WHEN** the viewer scrolls to the end of the list
- **THEN** the next page of posts is appended below the existing ones

#### Scenario: The feed stops when no more posts exist

- **GIVEN** the feed has shown its last page of posts
- **WHEN** the viewer scrolls to the end of the list
- **THEN** no further posts are added

### Requirement: Paging never skips or repeats tied posts

Page boundaries SHALL NOT skip or repeat posts that share the same sort value.

#### Scenario: Posts with equal likes all appear once

- **GIVEN** many posts that all have zero likes
- **WHEN** the viewer scrolls through every page of the feed
- **THEN** every post appears exactly once

### Requirement: The feed offers Hot, New and Top sorts with Hot as the default

The feed SHALL offer Hot, New and Top sorts, and SHALL open on Hot.

#### Scenario: Hot sort lists the best-scoring posts first

- **GIVEN** posts with different hot scores
- **WHEN** the viewer has the Hot sort selected
- **THEN** posts appear in order from highest hot score to lowest

#### Scenario: New sort lists the newest posts first

- **WHEN** the viewer selects the New sort
- **THEN** posts appear in order from most recently created to least recently created

#### Scenario: Top sort lists the most-liked posts first across all time

- **GIVEN** posts created at different times with different like totals
- **WHEN** the viewer selects the Top sort
- **THEN** posts appear in order from most likes to fewest, with no time window applied

### Requirement: Changing the sort restarts the feed from its first page

Changing the feed's sort SHALL clear the list and reload it from the first page under the new sort.

#### Scenario: Switching sort replaces the feed contents

- **GIVEN** the feed has loaded several pages under one sort
- **WHEN** the viewer selects a different sort
- **THEN** the list is cleared and the first page under the new sort is shown

### Requirement: Comment threads keep their fixed order whatever the feed's sort

Comment threads SHALL keep their own fixed order and SHALL NOT change when the viewer changes the feed's sort.

#### Scenario: Thread order is unaffected by the feed sort

- **GIVEN** a post whose comments are shown in its thread
- **WHEN** the viewer changes the feed's sort
- **THEN** the thread's comments keep their existing order

### Requirement: The feed lists top-level posts only

The home feed SHALL show only top-level posts and SHALL NOT show comments as feed entries.

#### Scenario: A comment does not appear as a feed entry

- **GIVEN** a post that has comments
- **WHEN** the viewer loads the home feed
- **THEN** each comment appears only under its own post and not as a separate entry

### Requirement: A post's hot score rises with its net likes and with its age

The hot score of each post SHALL rise with its net likes and with the time since it was created, so that newer posts start higher than older posts with the same likes.

#### Scenario: More net likes rank higher at the same age

- **GIVEN** two posts of the same age, one with ten net likes and one with a hundred net likes
- **WHEN** the feed is sorted by Hot
- **THEN** the post with a hundred net likes ranks above the post with ten

#### Scenario: A newer post with the same likes outranks an older one

- **GIVEN** two posts with the same net likes, one created earlier than the other
- **WHEN** the feed is sorted by Hot
- **THEN** the newer post ranks above the older post

#### Scenario: A new like or comment updates the hot score immediately

- **GIVEN** a post with a known hot score
- **WHEN** a user likes the post or comments on it
- **THEN** the post's hot score reflects the new like or comment count at once

### Requirement: Feed reads are rate-limited for every reader

The feed SHALL refuse a reader who requests pages faster than the allowed rate.

#### Scenario: Requests above the allowed rate are refused

- **GIVEN** a reader who has already requested feed pages at the allowed rate
- **WHEN** the reader requests another page beyond that rate
- **THEN** the request is refused
