## Purpose

Zhongli's kit as built, with the Stone Steles, the Jade Shield and its RES cut, and Planet Befall's meteor, and what is left of Resonant Waves, Chrysos and his other constellations.

## Requirements

### Requirement: Strikes, charged attack and plunges

Zhongli's normal attack SHALL be six strikes, the fifth of four hits, followed by a charged attack, a collision and two plunges.

#### Scenario: Normal attack lands six strikes

- **WHEN** the player strikes with Zhongli's normal attack
- **THEN** six strikes land in order, the fifth landing four hits

#### Scenario: Plunge landing

- **WHEN** Zhongli plunges
- **THEN** the plunge lands 0.4 seconds after it starts, provisionally

### Requirement: Stone Steles

Dominus Lapidis SHALL summon a Stone Stele 3 metres ahead of Zhongli, which resonates every 2 seconds and stands for 30 seconds.

#### Scenario: Press summons a stele

- **WHEN** the player presses Dominus Lapidis
- **THEN** a Stone Stele rises 3 metres ahead of Zhongli and lands Geo as it rises

#### Scenario: Stele resonates

- **GIVEN** a Stone Stele stands
- **WHEN** 2 seconds pass
- **THEN** it resonates Geo on the enemies within its 8 metre box

#### Scenario: Press with the most steles standing

- **GIVEN** the most steles already stand
- **WHEN** Zhongli presses Dominus Lapidis again
- **THEN** the newest stele ends as the new one lands

### Requirement: Jade Shield

Dominus Lapidis's hold SHALL cast a Jade Shield on the team at its hit, a Geo shield that absorbs every element at 150%.

#### Scenario: Hold casts the shield

- **WHEN** the player holds Dominus Lapidis and its hit lands
- **THEN** the team gains a Geo shield that absorbs every element at 150%

#### Scenario: Shield spent or recast

- **GIVEN** the Jade Shield stands
- **WHEN** it is spent or recast
- **THEN** its RES cut ends

### Requirement: Jade Shield RES cut

While the Jade Shield stands, each enemy within 7.5 metres of Zhongli and 10 metres high SHALL have 20% taken off every Elemental RES and its Physical RES, refreshed every 18 frames for a second.

#### Scenario: Enemy within the cut

- **GIVEN** the Jade Shield stands
- **WHEN** an enemy stands within 7.5 metres of Zhongli
- **THEN** its Elemental and Physical RES are cut by 20%

### Requirement: Dominance of Earth

From Ascension 4, Zhongli's normal, charged and plunging attacks SHALL add 1.39% of his Max HP to their base damage, his stele and hold hits SHALL add 1.9%, and the meteor SHALL add 33%.

#### Scenario: Attacks gain the bonus

- **GIVEN** Zhongli is at Ascension 4
- **WHEN** he strikes with a normal attack
- **THEN** its base damage rises by 1.39% of his Max HP

#### Scenario: Meteor gains the bonus

- **GIVEN** Zhongli is at Ascension 4
- **WHEN** Planet Befall's meteor lands
- **THEN** its base damage rises by 33% of his Max HP

### Requirement: Planet Befall

Planet Befall SHALL drop a meteor 5 metres ahead of Zhongli, with a circle of radius 7.5 metres that grows to 9 metres with four constellations.

#### Scenario: Meteor lands

- **WHEN** the player casts Planet Befall
- **THEN** the meteor lands at 101 frames on the enemies within its circle

#### Scenario: Four constellations widen the meteor

- **GIVEN** Zhongli has four constellations
- **WHEN** the player casts Planet Befall
- **THEN** the meteor's circle has a radius of 9 metres

#### Scenario: Two constellations cast a shield

- **GIVEN** Zhongli has two constellations
- **WHEN** the player casts Planet Befall
- **THEN** a Jade Shield is cast as the burst starts

### Requirement: Unbuilt constellations and effects

Resonant Waves, Chrysos, Bounty of Dominator, Petrification and the hold's Geo drain SHALL have no effect in the world yet.

#### Scenario: Shield absorbs without further effect

- **WHEN** the Jade Shield absorbs a strike
- **THEN** no Resonant Waves or Chrysos effect follows
