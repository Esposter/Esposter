## ADDED Requirements

### Requirement: Copy style takes one selected element's look into the session

Ctrl or Cmd with Alt and C SHALL copy the look of the one selected element into the session, and leave the system clipboard as it was.

#### Scenario: Copy style takes the look of the selected element

- **GIVEN** a shape with a red outline, a dashed outline, a blue fill and round corners, selected alone
- **WHEN** the owner copies its style with Ctrl or Cmd, Alt and C
- **THEN** the copied look holds the outline colour, the outline width, the dash pattern, the fill and the corners
- **AND** the system clipboard holds what it held before

#### Scenario: Copy style needs exactly one selected element

- **GIVEN** a shape copied and two elements selected
- **WHEN** the owner presses Ctrl or Cmd, Alt and C
- **THEN** the copied look is the one copied before

#### Scenario: Copying an image copies no look

- **GIVEN** a shape copied and an image selected alone
- **WHEN** the owner copies the style of the image
- **THEN** the copied look is empty
- **AND** pasting it onto a shape changes nothing

### Requirement: Paste style gives the selection the copied look

Ctrl or Cmd with Alt and V SHALL paste the copied look onto every selected element, each taking only the fields its kind holds, as one undo step.

#### Scenario: Paste style gives each element the fields its kind holds

- **GIVEN** a shape copied with a red outline, a dashed outline, a blue fill and large centred text, and a rectangle and a text box with a wrapped width selected together
- **WHEN** the owner pastes the style
- **THEN** the rectangle takes the outline colour, the dash pattern, the fill and the text size and alignment
- **AND** the text box takes its colour, its text size and its horizontal alignment
- **AND** the text box takes no dash pattern or fill and keeps its wrap and its width

#### Scenario: Paste style clears an arrowhead the copied arrow lacks

- **GIVEN** an arrow with a triangle at its end and none at its start copied, and a second arrow with a triangle at its start selected alone
- **WHEN** the owner pastes the style
- **THEN** the second arrow takes the triangle at its end
- **AND** its start has no arrowhead

#### Scenario: Paste style is one undo step

- **GIVEN** a copied look pasted onto three selected elements
- **WHEN** the owner undoes once
- **THEN** all three elements hold the look they held before the paste

#### Scenario: Paste style with nothing copied changes nothing

- **GIVEN** no look copied in the session and a shape selected alone
- **WHEN** the owner pastes the style
- **THEN** the shape is unchanged
- **AND** the undo history holds no new step

#### Scenario: A copied style pastes onto another whiteboard

- **GIVEN** a look copied on one whiteboard
- **WHEN** the owner opens another whiteboard in the same session, selects a shape there and pastes the style
- **THEN** the shape takes the copied look
