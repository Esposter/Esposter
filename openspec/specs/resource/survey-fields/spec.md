## Purpose

The question fields a respondent answers a survey with: each question kind drawn from the app's UI library, labelled by its title, operable by keyboard, and showing the message the runner gives it.

## Requirements

### Requirement: Every question is labelled by its title and operable by keyboard

A question field SHALL be labelled by the question's title and answerable by keyboard alone, in both design styles.

#### Scenario: answers with the choice an arrow key moves to

- **GIVEN** a radio group question titled "Favourite colour" with three choices
- **WHEN** a respondent moves to it by the keyboard and picks a choice with the arrow keys
- **THEN** the answer holds the chosen value
- **AND** the group's accessible label is "Favourite colour"

#### Scenario: A ranking question is reordered by keyboard

- **GIVEN** a ranking question with three choices
- **WHEN** a respondent moves the third choice up with Alt and the up arrow
- **THEN** the answer lists it second

### Requirement: An email, telephone or URL question is drawn as a field of its kind

An email, telephone or URL question SHALL be drawn as a text field typed as that kind, so the respondent's keyboard and autofill are the kind's.

#### Scenario: An email question offers the browser's email autofill

- **GIVEN** a text question of the email kind
- **WHEN** the question is drawn
- **THEN** its input is typed as an email
- **AND** the input offers the email autofill

### Requirement: A required question's title says so once and the field's hint does not repeat it

A required question SHALL show the required mark once beside its title, and its field's hint SHALL carry only the question's description.

#### Scenario: A required text question's label shows the mark and its hint is the description alone

- **GIVEN** a text question that is required and has the description "Your work address"
- **WHEN** the question is drawn
- **THEN** its label shows the required mark and the word required
- **AND** its hint is "Your work address"

### Requirement: A dropdown or tag box shows its placeholder until a respondent picks

A dropdown or tag box SHALL show the placeholder its author set in its trigger while nothing is picked.

#### Scenario: A dropdown shows its placeholder until a choice is picked

- **GIVEN** a dropdown question with the placeholder "Pick a colour" and no choice picked
- **WHEN** the question is drawn
- **THEN** its trigger shows "Pick a colour"
- **AND** the placeholder is not one of its choices

### Requirement: An image picker draws each picture at the size its author set

An image picker SHALL draw each picture at the pixel width and height its author set, and SHALL draw an unsized picture at the default size of a row's mark.

#### Scenario: A sized picture is drawn at its pixels and keeps its title beside it

- **GIVEN** an image picker whose pictures are set to 120 pixels wide and 80 pixels high
- **WHEN** the question is drawn
- **THEN** each picture is drawn 120 pixels wide and 80 pixels high
- **AND** each picture's title is still beside it

#### Scenario: An unsized picture is drawn at the default mark size

- **GIVEN** an image picker whose pictures have no size set
- **WHEN** the question is drawn
- **THEN** each picture is drawn at the default size of a row's mark

### Requirement: A question that fails a check shows its message beside the field

A question field SHALL show the message the runner gives its question beside the control, marking the control invalid for assistive technology.

#### Scenario: shows its error beside it and marks it invalid

- **GIVEN** a text question that the runner gives an error message
- **WHEN** the field is drawn with that error
- **THEN** the message is shown as an alert beside the field
- **AND** the input is marked invalid

### Requirement: A rating question draws the scale its type names

A rating question SHALL draw its steps as numbers, as stars or as faces, as its scale type names, and each step SHALL be named by its number.

#### Scenario: A star scale fills up to the chosen star

- **GIVEN** a rating question of five stars with its answer at three
- **WHEN** the question is drawn
- **THEN** the first three stars are filled and the last two are outlined
- **AND** each star is named by its number

#### Scenario: A star scale previews the stars up to the pointer and returns to the answer

- **GIVEN** a star scale with its answer at one
- **WHEN** the pointer rests on the fourth star and then leaves the scale
- **THEN** the first four stars are filled while it rests there
- **AND** only the first star is filled once it leaves

#### Scenario: A smiley scale draws one face per step with the chosen face in the accent

- **GIVEN** a rating question of five faces with its answer at four
- **WHEN** the question is drawn
- **THEN** each step draws a face, running from the angriest face at the first step to the happiest at the last
- **AND** the face of the chosen step is drawn in the accent colour while the others are muted

#### Scenario: A rating scale is chosen by the arrow keys

- **GIVEN** a star scale with its answer at two
- **WHEN** the respondent presses the right arrow on it
- **THEN** the answer holds three

### Requirement: The page renderer walks a survey's pages and shows what blocks a move

The page renderer SHALL move a respondent between a survey's visible pages and, when a move is refused, show the refusal as an alert and move focus to the first question that blocks it.

#### Scenario: walks a two-page document forward and back, keeping the first page's answer, and offers Complete on the last page

- **GIVEN** a survey of two pages
- **WHEN** the respondent answers the first page, goes to the next page and then back
- **THEN** the first page shows its answer again
- **AND** the second page offers Complete in place of Next

#### Scenario: a failed next shows its message and moves focus to the page's first blocking question

- **GIVEN** a page of two required questions that are both unanswered
- **WHEN** the respondent goes to the next page
- **THEN** the refusal is shown as an alert
- **AND** focus moves to the first of the two questions
