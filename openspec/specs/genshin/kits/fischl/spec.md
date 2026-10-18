## Purpose

Fischl's kit as built: her arrows, charged attack and plunges, and Nightrider's Oz with Midnight Phantasmagoria, with Oz's attacks, the swap spawn and her constellations built, and Stellar Predator, the skill's recast, the particles and her Hexerei kit left unbuilt.

## Requirements

### Requirement: Basic attacks

Fischl's normal attacks SHALL be five arrows, a fully charged aimed shot, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays five arrows in order

- **GIVEN** Fischl is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her five arrows fire in order

#### Scenario: Fully charged aimed shot fires

- **GIVEN** Fischl is the character on the field
- **WHEN** the player holds the attack button until the shot is fully charged
- **THEN** the fully charged aimed shot fires

### Requirement: Nightrider summons Oz

Nightrider SHALL summon Oz 18 frames after it is pressed, and Oz SHALL attack every 59 frames while it stands, and Nightrider SHALL cool down before it can be pressed again.

#### Scenario: Pressing Nightrider summons Oz

- **GIVEN** Fischl is the character on the field
- **WHEN** the player presses Nightrider
- **THEN** Oz appears 18 frames later and attacks every 59 frames while it stands

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Nightrider was pressed and its cooldown has not ended
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Midnight Phantasmagoria summons Oz

Midnight Phantasmagoria SHALL summon Oz 113 frames after it is cast, ending any Oz already standing, and it SHALL be refused without the energy it costs.

#### Scenario: The burst summons Oz after 113 frames

- **GIVEN** Fischl has enough energy
- **WHEN** the player casts Midnight Phantasmagoria
- **THEN** Oz appears 113 frames later

#### Scenario: The burst is refused without enough energy

- **GIVEN** Fischl has less energy than the burst costs
- **WHEN** the player casts Midnight Phantasmagoria
- **THEN** it does not cast

### Requirement: Swap spawn during the burst

When Fischl is swapped out during Midnight Phantasmagoria, Oz SHALL spawn one frame after the swap and make its first attack 63 frames later.

#### Scenario: A swap during the burst spawns Oz

- **GIVEN** Midnight Phantasmagoria has been cast
- **WHEN** the player swaps characters
- **THEN** Oz spawns one frame after the swap
- **AND** its first attack lands 63 frames later

### Requirement: One Oz at a time

At most one Oz SHALL stand at a time, and a new Nightrider press or Midnight Phantasmagoria cast SHALL end the Oz already standing.

#### Scenario: A new Oz ends the one standing

- **GIVEN** Oz is standing
- **WHEN** the player casts Midnight Phantasmagoria
- **THEN** the Oz already standing ends and a new Oz takes its place

### Requirement: Thundering Retribution from Ascension 4

From Ascension 4, an Electro-related reaction SHALL trigger Thundering Retribution, a strike on the enemy that reacted, at most once every half second.

#### Scenario: A reaction triggers a strike

- **GIVEN** Fischl is at Ascension 4
- **WHEN** an Electro-related reaction occurs and the half-second interval is clear
- **THEN** Thundering Retribution strikes the enemy that reacted

#### Scenario: A reaction within the interval triggers no strike

- **GIVEN** Thundering Retribution struck less than half a second ago
- **WHEN** another Electro-related reaction occurs
- **THEN** no strike is made

### Requirement: Constellation 2 gives Oz's hit Devourer of All Sins

From constellation 2, the hit Oz's summon deals SHALL be Devourer of All Sins' in place of Oz's own.

#### Scenario: Oz's hit is Devourer of All Sins from constellation 2

- **GIVEN** Fischl is at constellation 2
- **WHEN** Nightrider's Oz summons its hit
- **THEN** the hit is Devourer of All Sins

### Requirement: Constellation 1 and 6 strikes

From constellation 1, while Oz is not on the field and Fischl is the character on the field, Gaze of the Deep SHALL strike together with each of her normal attacks that lands, and from constellation 6, Evernight Raven SHALL strike together with each attack of the character on the field.

#### Scenario: Gaze of the Deep strikes with a normal attack while Oz is away

- **GIVEN** Fischl is at constellation 1 and Oz is not on the field
- **WHEN** one of her normal attacks lands
- **THEN** Gaze of the Deep strikes along with it

#### Scenario: Gaze of the Deep does not strike while Oz stands

- **GIVEN** Fischl is at constellation 1 and Oz is on the field
- **WHEN** one of her arrows strikes
- **THEN** Gaze of the Deep does not strike

#### Scenario: Evernight Raven strikes with the field's attack

- **GIVEN** Fischl is at constellation 6
- **WHEN** the character on the field makes an attack
- **THEN** Evernight Raven strikes along with it

### Requirement: Constellation 4 heal

From constellation 4, Her Pilgrimage of Bleak SHALL heal one frame after Oz spawns from a burst, whether or not a swap caused the spawn.

#### Scenario: The heal lands after a burst spawn

- **GIVEN** Fischl is at constellation 4
- **WHEN** Oz spawns from Midnight Phantasmagoria
- **THEN** Her Pilgrimage of Bleak heals one frame later
