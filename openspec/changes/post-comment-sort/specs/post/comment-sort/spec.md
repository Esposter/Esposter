## ADDED Requirements

### Requirement: Comment sort offers Hot, Top, New and Old

The comment section of a post SHALL offer a Sort by control with the options Hot, Top, New and Old.

#### Scenario: Comment sort lists Hot, Top, New and Old

- **GIVEN** a reader is on a post that has comments
- **WHEN** the reader opens the Sort by control above the comments
- **THEN** the control lists Hot, Top, New and Old

### Requirement: Comment sort orders replies by the chosen option

The comment section of a post SHALL order its replies by the option the reader chose.

#### Scenario: Hot keeps the ranked reply order

- **GIVEN** a post whose replies have different hot scores
- **WHEN** the reader views the comments with Hot selected
- **THEN** the replies are listed by hot score, highest first, with ties broken by reply id, highest first

#### Scenario: Top lists the most-liked reply first

- **GIVEN** a post whose replies have different like counts
- **WHEN** the reader selects Top
- **THEN** the replies are listed by like count, highest first
- **AND** replies with equal like counts are ordered by reply id, highest first

#### Scenario: New lists the newest reply first

- **GIVEN** a post with several replies
- **WHEN** the reader selects New
- **THEN** the replies are listed newest first

#### Scenario: Old lists the oldest reply first

- **GIVEN** a post with several replies
- **WHEN** the reader selects Old
- **THEN** the replies are listed oldest first

### Requirement: Comment sort applies to every open branch

A change to the comment sort SHALL apply to every open reply branch of the post, not only the top level.

#### Scenario: Changing the comment sort re-reads every open branch from page one

- **GIVEN** a reader has expanded two replies, each with more replies loaded past its first page
- **WHEN** the reader changes the Sort by control to New
- **THEN** every open branch shows its first page under the New order
- **AND** no open branch keeps the order it had before the change

#### Scenario: Expanded replies stay expanded after a sort change

- **GIVEN** a reader has expanded a reply
- **WHEN** the reader changes the Sort by control
- **THEN** that reply is still expanded

### Requirement: Comment sort resets to Hot on each visit

Opening a post SHALL start the comment sort at Hot, whatever sort the reader last chose on another post.

#### Scenario: Comment sort resets to Hot on the next post

- **GIVEN** a reader set the comment sort to Top on one post
- **WHEN** the reader opens a different post
- **THEN** the Sort by control shows Hot
- **AND** the comments are listed in Hot order

### Requirement: Feed sort keeps Hot, New and Top

The feed's Sort by control SHALL offer exactly Hot, New and Top, leaving Old out.

#### Scenario: Feed Sort by omits Old

- **GIVEN** a reader is on the feed
- **WHEN** the reader opens the feed's Sort by control
- **THEN** the control lists Hot, New and Top
- **AND** Old is not listed

### Requirement: Old pages a thread oldest first

The Old comment sort SHALL page a thread from its oldest reply forward, showing each reply exactly once.

#### Scenario: Paging Old reaches every reply once

- **GIVEN** a thread with more replies than one page holds, and Old selected
- **WHEN** the reader loads each following page of replies
- **THEN** every reply appears exactly once
- **AND** the replies run from oldest to newest across the pages
