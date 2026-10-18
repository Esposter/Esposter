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

Hu Tao's Spirit Soother SHALL heal the character it targets when that character's HP is under half.

#### Scenario: Spirit Soother heals a character under half HP

- **GIVEN** a character whose HP is under half of its maximum
- **WHEN** Hu Tao's Spirit Soother takes effect on that character
- **THEN** the character is healed

#### Scenario: Spirit Soother does not heal a character at or above half HP

- **GIVEN** a character whose HP is at least half of its maximum
- **WHEN** Hu Tao's Spirit Soother takes effect on that character
- **THEN** the character is not healed

### Requirement: Swap Ends Field Effect

A field effect of Klee, Xiao, Ningguang, Razor or Xingqiu SHALL end when its character is swapped off the field.

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
