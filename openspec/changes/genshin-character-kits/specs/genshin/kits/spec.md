## ADDED Requirements

### Requirement: Traveler Element From Statue

The Traveler's skill and burst SHALL deal the element of the Statue of The Seven the Traveler has resonated with.

#### Scenario: the Traveler's skill deals the element of the resonated statue

- **GIVEN** the Traveler has resonated with a Statue of The Seven of a given element
- **WHEN** the Traveler uses its elemental skill
- **THEN** the skill deals that element's damage

#### Scenario: the Traveler deals no element before any statue is resonated with

- **GIVEN** the Traveler has not resonated with any Statue of The Seven
- **WHEN** the Traveler uses its elemental skill or burst
- **THEN** the skill and burst deal no element

### Requirement: Playable Character Own Kit

Each playable character SHALL fight by its own kit once a kit is written for it, and SHALL fight by the Traveler's kit until then.

#### Scenario: a character with its own kit fights by it

- **GIVEN** a playable character with a kit of its own
- **WHEN** the character uses its elemental skill
- **THEN** the hits are those of the character's own kit

#### Scenario: a character without a kit of its own fights by the Traveler's kit

- **GIVEN** a playable character with no kit of its own
- **WHEN** the character uses its elemental skill
- **THEN** the hits are those of the Traveler's kit

### Requirement: Passives Open At Their Ascension Phase

A character's passive SHALL take effect once the character reaches the ascension phase its talent table names for that passive.

#### Scenario: a passive takes effect at its ascension phase

- **GIVEN** a character whose passive is named at a given ascension phase
- **WHEN** the character reaches that phase
- **THEN** the passive takes effect

#### Scenario: a passive does not take effect below its ascension phase

- **GIVEN** a character whose passive is named at a given ascension phase
- **WHEN** the character is below that phase
- **THEN** the passive does not take effect

### Requirement: Spirit Soother Heal

Hu Tao's Spirit Soother SHALL heal Hu Tao once for each enemy its hit strikes, up to five times a cast, by a share of her Max HP that is larger while her HP is at or under half.

#### Scenario: the Spirit Soother heals Hu Tao above half HP

- **GIVEN** Hu Tao's HP is above half of her maximum
- **WHEN** Spirit Soother's hit strikes an enemy
- **THEN** Hu Tao is healed by her base share of Max HP

#### Scenario: the Spirit Soother heals Hu Tao more at or below half HP

- **GIVEN** Hu Tao's HP is at or under half of her maximum
- **WHEN** Spirit Soother's hit strikes an enemy
- **THEN** Hu Tao is healed by the larger share of Max HP

#### Scenario: the Spirit Soother heals at most five times a cast

- **GIVEN** Spirit Soother has healed Hu Tao five times in its cast
- **WHEN** its hit strikes a further enemy
- **THEN** Hu Tao is not healed

#### Scenario: a new cast of the Spirit Soother starts its heals again

- **GIVEN** Spirit Soother has healed Hu Tao five times in a cast
- **WHEN** Spirit Soother is cast again and its hit strikes an enemy
- **THEN** Hu Tao is healed

### Requirement: Hu Tao's Constellation 4 and 6 CRIT Rate

Hu Tao's Constellation 4 SHALL give each other deployed member 12% CRIT Rate for 15 seconds when an enemy her Blood Blossom marked is defeated, and her Constellation 6 SHALL give her 100% CRIT Rate for 10 seconds when a drain leaves her at a quarter of her HP or under, once in 60 seconds.

#### Scenario: at constellation 4, defeating an enemy Blood Blossom marked gives each other member CRIT Rate

- **GIVEN** Hu Tao is at Constellation 4 and her Blood Blossom is on an enemy
- **WHEN** that enemy is defeated
- **THEN** each other deployed member gains 12% CRIT Rate for 15 seconds

#### Scenario: defeating an enemy that Blood Blossom did not mark, or whose mark has run out, gives no CRIT Rate

- **GIVEN** Hu Tao is at Constellation 4
- **WHEN** an enemy with no Blood Blossom on it, or with one whose seconds have run out, is defeated
- **THEN** no member gains CRIT Rate

#### Scenario: below constellation 4, defeating an enemy Blood Blossom marked gives no CRIT Rate

- **GIVEN** Hu Tao is below Constellation 4
- **WHEN** an enemy her Blood Blossom marked is defeated
- **THEN** no member gains CRIT Rate

#### Scenario: at constellation 6, a drop to 25% HP or less sets Hu Tao's CRIT Rate to 100%

- **GIVEN** Hu Tao is at Constellation 6
- **WHEN** a drain leaves her at 25% of her HP or under
- **THEN** Hu Tao gains 100% CRIT Rate for 10 seconds

#### Scenario: above 25% HP, a drop gives Hu Tao no CRIT Rate

- **GIVEN** Hu Tao is at Constellation 6
- **WHEN** a drain leaves her above 25% of her HP
- **THEN** Hu Tao gains no CRIT Rate

#### Scenario: a second drop to 25% HP within 60 seconds gives Hu Tao no more CRIT Rate

- **GIVEN** Hu Tao's Constellation 6 CRIT Rate has just been given
- **WHEN** a drain leaves her at 25% of her HP or under again within 60 seconds
- **THEN** Hu Tao gains no further CRIT Rate

#### Scenario: below constellation 6, a drop to 25% HP or less gives Hu Tao no CRIT Rate

- **GIVEN** Hu Tao is below Constellation 6
- **WHEN** a drain leaves her at 25% of her HP or under
- **THEN** Hu Tao gains no CRIT Rate

### Requirement: Raincutter's Waves on Landings

Raincutter SHALL cast a wave of swords where the character on the field stands as a normal attack of that character lands, at most one wave a second, and not as the attack starts.

#### Scenario: Raincutter's wave is cast as a normal attack lands, not as it starts

- **GIVEN** Raincutter stands with Xingqiu on the team
- **WHEN** a normal attack of the character on the field starts, and then lands
- **THEN** no wave is cast at the start, and one wave of two swords is cast at the landing

#### Scenario: Raincutter's waves follow the field's normal attacks once a second

- **GIVEN** Raincutter stands
- **WHEN** normal attacks of the character on the field land, with one landing within the second of the last wave
- **THEN** each landing outside the second casts a wave, and the landing within it casts none

### Requirement: Swap Ends Field Effect

A field effect of Klee, Xiao, Ningguang or Razor SHALL end when its character is swapped off the field.

#### Scenario: Klee's Sparks 'n' Splash ends when Klee is swapped off the field

- **GIVEN** Klee's Sparks 'n' Splash is active with Klee on the field
- **WHEN** Klee is swapped off the field
- **THEN** Sparks 'n' Splash ends

#### Scenario: a field effect continues while its character stays on the field

- **GIVEN** Xiao's Bane of All Evil is active with Xiao on the field
- **WHEN** another character is swapped in and Xiao remains on the field
- **THEN** Bane of All Evil stays active

### Requirement: Hit Rolls

Klee's Explosive Spark and Yelan's Breakthrough Barb SHALL each be rolled as their hit strikes, at the chance the character's kit names.

#### Scenario: Klee's Explosive Spark is applied at a 50% chance on a hit

- **GIVEN** Klee's hit that carries Explosive Spark strikes an enemy
- **WHEN** the hit resolves
- **THEN** Explosive Spark is applied with a 50% chance

#### Scenario: Yelan's Breakthrough Barb is rolled on each Lingering Lifeline hit

- **GIVEN** Yelan's Lingering Lifeline hit strikes an enemy
- **WHEN** the hit resolves
- **THEN** Breakthrough Barb is rolled at 34%

### Requirement: Nefer Kit

Nefer SHALL fight by a kit of her own built from her game records.

#### Scenario: Nefer's elemental skill uses her own hits

- **GIVEN** Nefer is on the field with her kit built
- **WHEN** Nefer uses her elemental skill
- **THEN** the hits and their area are those of her own kit

### Requirement: World Entry Size Ceiling

CI SHALL refuse a world build whose entry is over its size ceiling.

#### Scenario: a world build under its size ceiling passes

- **GIVEN** a world build whose entry is under its size ceiling
- **WHEN** CI checks the build
- **THEN** the check passes

#### Scenario: a world build over its size ceiling is refused

- **GIVEN** a world build whose entry is over its size ceiling
- **WHEN** CI checks the build
- **THEN** the check fails and the build is refused
