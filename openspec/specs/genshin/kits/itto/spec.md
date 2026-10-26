## Purpose

Itto's kit as built: four strikes, the Saichimonji Slash and the Arataki Kesagiri his Superlative Superstrength turns it into, a collision and two plunges, Masatsu Zetsugi's hit with Ushi, and Royal Descent's ATK bonus and Geo conversion, with his Ascension 4 passive built, his constellations 1, 2 and 4 built and Constellation 6's Charged Attack CRIT DMG, and his Arataki Ichiban ATK SPD and Constellation 6's stack save not built.

## Requirements

### Requirement: Four strikes build Superlative Superstrength

Itto's four strikes SHALL play in order from the attack button, and as they land his second strike SHALL give one Superlative Superstrength stack and his fourth SHALL give two.

#### Scenario: Strike chain builds stacks

- **GIVEN** Itto is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order
- **AND** the second strike gives one stack
- **AND** the fourth strike gives two stacks

#### Scenario: Stacks stop at five

- **GIVEN** Itto holds five stacks
- **WHEN** a strike that gives stacks lands
- **THEN** the count stays at five

### Requirement: Charged attack is the Saichimonji Slash without stacks

Itto's charged attack SHALL be the Saichimonji Slash while he holds no Superlative Superstrength stacks.

#### Scenario: The Saichimonji Slash plays with no stacks

- **GIVEN** Itto holds no Superlative Superstrength stacks
- **WHEN** the player holds the attack button to charge
- **THEN** the Saichimonji Slash plays

### Requirement: Charged attack is the Arataki Kesagiri with stacks

While Itto holds Superlative Superstrength stacks, his charged attack SHALL be the Arataki Kesagiri, which costs no stamina.

#### Scenario: The Arataki Kesagiri combo plays for the stacks held

- **GIVEN** Itto holds stacks
- **WHEN** the player holds the attack button to charge
- **THEN** combo slashes play in turn from the left and the right, one for each stack but the last
- **AND** a final slash follows the combo
- **AND** no stamina is spent

#### Scenario: A stack gained mid-combo waits for the next charged attack

- **GIVEN** the Arataki Kesagiri combo is playing
- **WHEN** Itto gains a stack
- **THEN** the stack waits for the next charged attack

### Requirement: Masatsu Zetsugi summons Ushi

Masatsu Zetsugi SHALL strike the enemy it turns to and summon Ushi, a taunt that holds all of Itto's Max HP for six seconds from its hit.

#### Scenario: Masatsu Zetsugi's hit summons Ushi

- **GIVEN** Itto is the character on the field
- **WHEN** the player casts Masatsu Zetsugi
- **THEN** its hit strikes the enemy it turns to
- **AND** Ushi taunts that enemy for six seconds from the hit
- **AND** the first time the hit strikes, Itto gains one stack

### Requirement: Ushi gives stacks as it is struck and as it leaves

Ushi SHALL give Itto a stack each time an enemy strikes it, at most once every two seconds, and a further stack as it leaves.

#### Scenario: An enemy strike on Ushi gives a stack

- **GIVEN** Ushi stands and no stack was gained from it in the last two seconds
- **WHEN** an enemy strikes Ushi
- **THEN** Itto gains one stack

#### Scenario: A second strike within two seconds gives no stack

- **GIVEN** Itto gained a stack from Ushi less than two seconds ago
- **WHEN** an enemy strikes Ushi again
- **THEN** no stack is gained

#### Scenario: Ushi leaves and gives a stack

- **GIVEN** Ushi stands
- **WHEN** its seconds run out, its health is spent or a second Ushi sends it away
- **THEN** Ushi leaves
- **AND** Itto gains one stack

### Requirement: Royal Descent raises ATK and converts damage to Geo

Royal Descent SHALL raise Itto's ATK by a share of his DEF and his Normal ATK SPD, and turn his strikes, slashes and plunges into Geo damage, ending when he leaves the field.

#### Scenario: Royal Descent is cast

- **GIVEN** Itto is the character on the field
- **WHEN** the player casts Royal Descent
- **THEN** his ATK rises by a share of his DEF
- **AND** his Normal ATK SPD rises
- **AND** his strikes, slashes and plunges deal Geo damage

#### Scenario: The first and third strikes give stacks during Royal Descent

- **GIVEN** Royal Descent is active
- **WHEN** the first or third strike lands
- **THEN** it gives one stack

#### Scenario: Leaving the field ends Royal Descent

- **GIVEN** Royal Descent is active
- **WHEN** Itto leaves the field
- **THEN** the ATK and Normal ATK SPD rises end
- **AND** his attacks stop dealing Geo damage

### Requirement: Collision and plunges deal their own hits

Itto's collision and two plunges SHALL each deal their own hit.

#### Scenario: Plunge deals its own hit

- **GIVEN** Itto is in the air
- **WHEN** the player plunges
- **THEN** the plunge deals its own hit

### Requirement: Constellation 2 Energy and cooldown cut

From Constellation 2, Royal Descent SHALL, 9 frames after the cast, give Itto 6 Energy and cut his burst's cooldown by 1.5 seconds for each Geo member of the team, at most three.

#### Scenario: Geo members restore energy and cut the cooldown

- **GIVEN** Itto is at Constellation 2 and the team holds two Geo members besides him
- **WHEN** he casts Royal Descent
- **THEN** 18 Energy is restored to him
- **AND** his burst's cooldown is cut by 4.5 seconds

#### Scenario: Below Constellation 2 nothing is given

- **GIVEN** Itto is at Constellation 1
- **WHEN** he casts Royal Descent
- **THEN** no Energy is restored and the cooldown is not cut

### Requirement: Constellation 4 team buff

From Constellation 4, when Royal Descent's Raging Oni King state ends, every deployed member SHALL gain 20% ATK and 20% DEF for 10 seconds.

#### Scenario: The state's end gives the team its buff

- **GIVEN** Itto is at Constellation 4 and is the Raging Oni King
- **WHEN** the state ends by its seconds or by his leaving the field
- **THEN** every deployed member gains 20% ATK and 20% DEF for 10 seconds

### Requirement: Constellation 6 Charged Attack CRIT DMG

From Constellation 6, Itto's Charged Attacks SHALL deal 70% more CRIT DMG.

#### Scenario: Charged Attack deals more CRIT DMG

- **GIVEN** Itto is at Constellation 6
- **WHEN** his Charged Attack lands
- **THEN** its CRIT DMG is raised by 70%
