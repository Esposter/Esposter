## Purpose

The self-referencing post model, CRUD procedures, rich-text editing, and profanity filtering. A post and a comment are the same kind of item, told apart only by whether they reply to something, and every rule on this page follows from that distinction.

## Requirements

### Requirement: A post has a title and a comment has a description

A post SHALL require a title, and a comment SHALL require a description and SHALL NOT have a title.

#### Scenario: A post is refused without a title

- **GIVEN** a signed-in user writing a new post
- **WHEN** the user submits the post without a title
- **THEN** the post is refused and nothing is saved

#### Scenario: A comment is refused without a description

- **GIVEN** a signed-in user writing a comment on a post
- **WHEN** the user submits the comment without a description
- **THEN** the comment is refused and nothing is saved

#### Scenario: A comment has no title field

- **GIVEN** a signed-in user writing a comment on a post
- **WHEN** the user opens the comment editor
- **THEN** no title field is offered

### Requirement: Titles and descriptions have length limits

A post title SHALL be at most 300 characters long, and a description SHALL be at most 1000 characters long.

#### Scenario: A title over the limit is refused

- **GIVEN** a signed-in user writing a post
- **WHEN** the user submits a title longer than 300 characters
- **THEN** the post is refused and nothing is saved

#### Scenario: A description over the limit is refused

- **GIVEN** a signed-in user writing a post or a comment
- **WHEN** the user submits a description longer than 1000 characters
- **THEN** the submission is refused and nothing is saved

### Requirement: Descriptions are written as rich text

Post descriptions and comments SHALL be written in rich text and SHALL keep their formatting when saved.

#### Scenario: Formatting survives saving

- **GIVEN** a signed-in user writing a post description with formatting applied
- **WHEN** the user saves the post
- **THEN** the saved post shows the same formatting

### Requirement: Profane words in written text are censored before saving

A post or comment SHALL have profane words in its title or description censored before it is saved.

#### Scenario: A profane word is censored in a saved post

- **GIVEN** a signed-in user writing a post whose title contains a word on the profanity list
- **WHEN** the user saves the post
- **THEN** the saved title shows that word censored

#### Scenario: A profane word is censored in a saved comment

- **GIVEN** a signed-in user writing a comment containing a word on the profanity list
- **WHEN** the user saves the comment
- **THEN** the saved comment shows that word censored

### Requirement: Only the author can edit or delete a post or comment

A post or comment SHALL be editable and deletable only by the user who wrote it, whatever role any other user holds.

#### Scenario: The author can edit their own post

- **GIVEN** a post written by the signed-in user
- **WHEN** the user edits the post and saves the change
- **THEN** the post shows the edited content

#### Scenario: Another user cannot edit someone else's post

- **GIVEN** a post written by a different user
- **WHEN** the signed-in user tries to edit that post
- **THEN** the edit is refused

#### Scenario: Another user cannot delete someone else's comment

- **GIVEN** a comment written by a different user
- **WHEN** the signed-in user tries to delete that comment
- **THEN** the deletion is refused and the comment remains

### Requirement: Post actions and comment actions never reach each other's items

Post actions SHALL NOT edit or delete a comment, and comment actions SHALL NOT edit or delete a post.

#### Scenario: A post action given a comment is refused

- **GIVEN** a comment written by the signed-in user
- **WHEN** a post edit or delete is aimed at that comment's identifier
- **THEN** the action is refused and the comment is unchanged

### Requirement: Deleting asks for confirmation and previews what goes

Deleting a post or a comment SHALL first ask the author to confirm, over a preview of everything the deletion removes.

#### Scenario: The confirmation previews the items that will be removed

- **GIVEN** a post with comments written by the signed-in user
- **WHEN** the user chooses to delete the post
- **THEN** a confirmation dialog opens that previews what will be removed

#### Scenario: Cancelling the confirmation keeps everything

- **GIVEN** the delete confirmation is open
- **WHEN** the user cancels it
- **THEN** nothing is deleted

### Requirement: Edit and delete are reached from each card's menu

The author's edit and delete actions SHALL be reached from the overflow menu on that author's card, which a right-click or a long press on the card also opens.

#### Scenario: A long press on a card opens its menu

- **GIVEN** a card for a post or comment written by the signed-in user
- **WHEN** the user long-presses the card
- **THEN** the card's menu opens with the edit and delete actions

### Requirement: Deleting a post removes its comments and their replies

Deleting a post SHALL also delete every comment on it, including all replies beneath those comments.

#### Scenario: A deleted post takes its whole thread with it

- **GIVEN** a post with comments and replies to those comments
- **WHEN** the author deletes the post
- **THEN** the post, its comments and all their replies are gone

### Requirement: Comment counts stay accurate across the whole thread

Creating or deleting a comment SHALL update the comment count on every post above it in the thread, not only on its direct parent.

#### Scenario: A reply deep in a thread counts on the root post

- **GIVEN** a post whose comment thread is three levels deep
- **WHEN** a user replies to the deepest comment
- **THEN** the comment count on the root post goes up by one

#### Scenario: Deleting a comment removes its replies from every count above

- **GIVEN** a comment that has replies beneath it
- **WHEN** the author deletes that comment
- **THEN** each post and comment above it lowers its count by the number of comments removed, including the deleted comment and all its replies

#### Scenario: Overlapping deletes in one thread both count once

- **GIVEN** two comments in the same thread, one nested beneath the other
- **WHEN** both are deleted at the same time
- **THEN** each post and comment above them shows a count that reflects both removals exactly once

### Requirement: Reply branches stay collapsed until the reader expands them

Replies SHALL stay collapsed until the reader asks to see them, and SHALL show again without fetching when the reader collapses and re-expands them.

#### Scenario: Expanding a comment loads its replies

- **GIVEN** a comment with replies shown collapsed
- **WHEN** the reader expands it
- **THEN** its replies are shown

#### Scenario: Re-expanding shows replies already loaded

- **GIVEN** a comment whose replies the reader has already seen and then collapsed
- **WHEN** the reader expands it again
- **THEN** its replies are shown again straight away

### Requirement: Replies sit visibly under the comment they answer

Each reply SHALL be shown beneath the comment it answers, joined to that comment by a line so the reader can see which comment it answers.

#### Scenario: A reply is joined to its parent by a line

- **GIVEN** a comment with a reply shown beneath it
- **WHEN** the reader views the thread
- **THEN** a line runs from the parent comment's picture down to the reply

### Requirement: A comment nested past the display depth continues on its own page

A comment nested beyond the depth the thread displays SHALL offer to continue the thread on its own page, which shows that comment as a post with its surrounding context.

#### Scenario: Following a continue-thread offer opens the comment as a post

- **GIVEN** a comment nested past the displayed depth of a thread
- **WHEN** the reader chooses to continue that thread
- **THEN** the comment opens on its own page as a post with one level of its surrounding context

### Requirement: The post page shows the post, the editor and the thread in that order

The post page SHALL show the post with its title as the page heading, then the comment editor for a signed-in reader, then the thread, or an empty state when there are no comments.

#### Scenario: A post with no comments shows an empty state

- **GIVEN** a post that has no comments
- **WHEN** a reader opens the post page
- **THEN** the post is shown with an empty state where the thread would be

#### Scenario: A reader who is not signed in sees no comment editor

- **GIVEN** a reader who is not signed in
- **WHEN** the reader opens a post page
- **THEN** the comment editor is not shown
