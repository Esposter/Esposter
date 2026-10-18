## ADDED Requirements

### Requirement: A resident with a night spot moves to it at night

A resident with a night spot SHALL stand at that spot from seven in the evening to six in the morning and at the day spot otherwise.

#### Scenario: A resident moves to the night spot at seven in the evening

- **GIVEN** a resident has a day spot and a night spot
- **WHEN** the world clock passes seven in the evening
- **THEN** the resident stands at the night spot

#### Scenario: A resident with only a day spot keeps it through the night

- **GIVEN** a resident has only a day spot
- **WHEN** night falls
- **THEN** the resident stays at the day spot

### Requirement: A resident moves only while out of the player's view

A resident SHALL move to a new spot at the turn of the hour only once they are out of the player's view.

#### Scenario: A resident in view is not seen to jump at the hour

- **GIVEN** a resident is in the player's view when the hour turns
- **WHEN** the resident's spot changes
- **THEN** the resident stays where they are until out of view
- **AND** then appears at the new spot

### Requirement: A resident is absent at night only where the game marks it

A resident SHALL be absent at night only where the game's own record marks them absent by day alone.

#### Scenario: A resident marked absent at night is not drawn after dark

- **GIVEN** a resident is marked absent at night
- **WHEN** night falls
- **THEN** the resident is not drawn

#### Scenario: A resident not marked absent stays in the world at night

- **GIVEN** a resident is not marked absent at night
- **WHEN** night falls
- **THEN** the resident is drawn at their night spot or day spot

### Requirement: Residents follow the world's clock each frame

Each resident's spot SHALL be read from the world's clock every frame, so that a change of time moves residents as the hours do.

#### Scenario: Setting the time moves residents

- **GIVEN** residents stand at their day spots
- **WHEN** the player sets the time to night on the Time screen
- **THEN** the residents with night spots move to them

### Requirement: Nod-Krai's residents keep the hours the wiki gives

Each Nod-Krai resident SHALL keep the hours their wiki NPC page gives, and stand at the spot the scene-group record places them, since the wiki's Nod-Krai NPC pages give no positions.

#### Scenario: A Nod-Krai resident keeps the wiki's hours

- **GIVEN** the player is in Nod-Krai at ten in the morning
- **WHEN** the player looks for a resident whose page gives daytime hours
- **THEN** the resident stands at the day spot the scene-group record places them

### Requirement: A vendor sells only in their hours

A vendor SHALL offer their shop only while standing at their spot within the hours their page gives.

#### Scenario: A vendor is closed outside their hours

- **GIVEN** a vendor sells only by day
- **WHEN** the player talks to the vendor at night
- **THEN** no shop is offered
