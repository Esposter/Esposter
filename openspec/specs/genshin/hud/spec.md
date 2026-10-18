## Purpose

The heads-up display over the world, holding only the pieces the world backs. The Paimon button and the minimap in the top left with the quest tracker under them, the shortcuts in the top right, the stamina meter following the character, the deployed team's portraits down the right, the member on the field's health at the bottom's middle, its skill and burst buttons at the bottom right, and on a touch screen the touch layout's attack, aim, jump and sprint buttons beside them and the touch controls under them all. It hides on the backslash, as the game's Hide UI does, and under any menu, a talk or photo mode.

## Requirements

### Requirement: The HUD shows only the pieces the world backs

The heads-up display SHALL show a piece only with the feature it shows, and SHALL NOT show a piece as an inert copy.

#### Scenario: A piece whose feature is not built is absent

- **GIVEN** a piece of the game's heads-up display belongs to a feature not yet built
- **WHEN** the heads-up display is drawn over the world
- **THEN** that piece is not shown

#### Scenario: The deployed team's portraits appear with the party

- **GIVEN** the player has a deployed team
- **WHEN** the heads-up display is drawn
- **THEN** one portrait is shown for each deployed member, in slot order

### Requirement: The HUD hides under menus and when the player presses the backslash key

The heads-up display SHALL hide while a menu, the map, a talk or photo mode is open, and SHALL hide and show again each time the player presses the backslash key.

#### Scenario: The backslash key hides and shows the HUD

- **GIVEN** the heads-up display is shown in the world
- **WHEN** the player presses the backslash key
- **THEN** the heads-up display hides
- **AND** pressing the backslash key again shows it

#### Scenario: Opening a menu hides the HUD

- **GIVEN** the heads-up display is shown in the world
- **WHEN** the player opens a menu, the map, a talk or photo mode
- **THEN** the heads-up display is hidden for as long as that screen is open

### Requirement: The corner buttons open the screens the game opens from them

The Paimon button and the minimap SHALL each open the screen the game opens from them when pressed.

#### Scenario: Pressing the Paimon button opens the Paimon menu

- **GIVEN** the heads-up display is shown
- **WHEN** the player presses the Paimon button
- **THEN** the Paimon menu opens

#### Scenario: Pressing the minimap opens the map

- **GIVEN** the heads-up display is shown
- **WHEN** the player presses the minimap
- **THEN** the map opens

### Requirement: A shortcut opens the screen its key opens

Each shortcut in the top right SHALL open the screen that its own key opens when pressed.

#### Scenario: Pressing a shortcut taps its key

- **GIVEN** the heads-up display is shown
- **WHEN** the player presses a shortcut
- **THEN** the screen opens as its key would open it

### Requirement: A portrait press switches to that member

Pressing a portrait in the deployed team SHALL switch to that member as the member's number key does, and every other portrait SHALL be darkened for the switch cooldown after a switch.

#### Scenario: Pressing a portrait switches to its member

- **GIVEN** a deployed team with more than one member
- **WHEN** the player presses the portrait of a member
- **THEN** the switch is made as that member's number key would make it

#### Scenario: Other portraits darken during the switch cooldown

- **GIVEN** the player has just switched members
- **WHEN** the cooldown is still running
- **THEN** every other portrait is darkened by the share of the cooldown left

### Requirement: The member on the field shows its level and health

The health display SHALL show the field member's level and, as whole numbers, its current HP and its maximum HP.

#### Scenario: Health shows as whole numbers

- **GIVEN** the member on the field has an HP and a maximum HP
- **WHEN** the health display is drawn
- **THEN** it shows the level
- **AND** it shows the HP and the maximum HP as whole numbers

### Requirement: Holding a skill or burst button holds its key until release

Pressing and holding the skill or burst button SHALL hold its key in the world's input until the button is released, and releasing SHALL also happen when the heads-up display hides.

#### Scenario: A held skill button holds its key

- **GIVEN** the member on the field has its skill available
- **WHEN** the player presses and holds the skill button
- **THEN** the skill's key is held until the button is released

#### Scenario: Hiding the HUD releases held keys

- **GIVEN** the player is holding the skill button
- **WHEN** the heads-up display hides
- **THEN** the held key is released

### Requirement: Skill and burst buttons show cooldowns and energy

The skill and burst buttons SHALL show a cooldown that counts down in tenths of a second and SHALL fill the burst with the member's energy.

#### Scenario: A cooling skill shows its countdown

- **GIVEN** the member on the field has used its skill
- **WHEN** the cooldown runs
- **THEN** the skill button is darkened and counts its seconds down to a tenth

#### Scenario: A charged burst takes its element's colour

- **GIVEN** the member on the field has charged its burst
- **WHEN** the burst button is drawn
- **THEN** the burst's disc takes the colour of its element

### Requirement: The stamina meter stands beside the character until the pool is full

The stamina meter SHALL stand beside the character while the stamina pool is not full and SHALL fade out once the pool is full.

#### Scenario: The meter shows while stamina is spent

- **GIVEN** the stamina pool is not full
- **WHEN** the character is on screen
- **THEN** the meter stands beside the character

#### Scenario: The meter fades out when the pool is full

- **GIVEN** the meter is shown
- **WHEN** the stamina pool becomes full
- **THEN** the meter fades out where it stood

#### Scenario: The meter pulses red once stamina runs low

- **GIVEN** the stamina pool has fallen under an eighth of its full amount
- **WHEN** the meter is drawn
- **THEN** the fill turns red
- **AND** the track pulses red

### Requirement: The quest tracker shows the quest that V navigates to

The quest tracker SHALL show the quest that V navigates to, with its step and how far its counted objective has come, and SHALL raise a beam over that quest's objective.

#### Scenario: Pressing V navigates to the tracked quest

- **GIVEN** a quest is in progress
- **WHEN** the player presses V in the world or presses the tracker
- **THEN** the tracker's quest is navigated to
- **AND** a beam rises over its first objective

#### Scenario: With no quest navigated the tracker stays empty

- **GIVEN** no quest is loaded
- **WHEN** the tracker is drawn
- **THEN** it shows no quest title and no objective line

### Requirement: The tracker names the distance and height of the navigated objective

The tracker SHALL show the distance to the navigated objective and, when the objective stands well above or below the character, SHALL say so.

#### Scenario: A high objective is named as higher

- **GIVEN** the navigated objective stands at least the mark height above the character
- **WHEN** the tracker is drawn
- **THEN** its line shows the distance and the word for higher

#### Scenario: A low objective is named as lower

- **GIVEN** the navigated objective stands at least the mark height below the character
- **WHEN** the tracker is drawn
- **THEN** its line shows the distance and the word for lower

#### Scenario: An objective no region places shows no line

- **GIVEN** the navigated objective is not placed by any region in reach
- **WHEN** the tracker is drawn
- **THEN** no distance line is shown

### Requirement: The touch layout offers the action buttons on a touch screen

On a touch screen the heads-up display SHALL show the attack, jump and sprint buttons, plus the aim button when the member on the field wields a bow, and each button SHALL hold its action's key while pressed.

#### Scenario: A bow adds the aim button

- **GIVEN** a touch screen and a member on the field wielding a bow
- **WHEN** the heads-up display is drawn
- **THEN** the aim button is shown beside the attack, jump and sprint buttons

#### Scenario: A pressed action button holds its key

- **GIVEN** a touch screen with the action buttons shown
- **WHEN** the player presses and holds the jump button
- **THEN** the jump key is held until the button is released

### Requirement: Buttons carry the game's own icon for their action

Each button SHALL carry the game's own icon for its action, and a character's skill and burst buttons SHALL show that character's icons once the character has joined the party.

#### Scenario: A character's icons appear when it joins the party

- **GIVEN** a character is not yet in the party
- **WHEN** the character joins the party and its kit loads
- **THEN** its skill and burst buttons show its icons

#### Scenario: Buttons stay bare until their icons load

- **GIVEN** a deployed character's kit has not yet loaded
- **WHEN** its skill and burst buttons are drawn
- **THEN** they are shown without an icon

### Requirement: A press on the heads-up display does not reach the world

A mouse press on a heads-up display piece SHALL NOT act in the world, while a click on the world between the pieces SHALL still lock the pointer and turn the camera.

#### Scenario: A click on a piece is not an attack

- **GIVEN** the player clicks a heads-up display piece
- **WHEN** the click is handled
- **THEN** the world does not register an attack

#### Scenario: A click between the pieces reaches the world

- **GIVEN** the player clicks the world between the heads-up display pieces
- **WHEN** the click is handled
- **THEN** the pointer locks and the camera turns
