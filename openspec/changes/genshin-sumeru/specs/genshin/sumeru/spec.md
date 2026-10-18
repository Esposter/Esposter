## ADDED Requirements

### Requirement: The rainforest is dense with canopy, vines, mushrooms and pools

The rainforest SHALL show canopy trees whose crowns form a canopy, hanging vines, giant mushrooms, rivers and still pools under a green-gold haze.

#### Scenario: Walking under the rainforest canopy

- **GIVEN** a path through the rainforest
- **WHEN** the player walks under the trees
- **THEN** the crowns form a canopy overhead
- **AND** hanging vines and giant mushrooms are beside the path

#### Scenario: A river and still pools lie in the rainforest

- **GIVEN** a river and pools in the rainforest
- **WHEN** the player looks at them
- **THEN** the water lies still in the pools and runs in the river

### Requirement: The rainforest's plants and fungi glow at night

The rainforest's plants and fungi SHALL glow at night.

#### Scenario: Plants glow in the rainforest at night

- **GIVEN** the rainforest at night
- **WHEN** the player looks at its plants and fungi
- **THEN** they glow

### Requirement: The desert is dunes shaped by wind, with oases of water and palms

The desert SHALL show dunes shaped by ridge lines with sand carried off their crests by the wind, and oases of water with palms.

#### Scenario: Wind carries sand off the dune crests

- **GIVEN** a dune in the desert with wind blowing
- **WHEN** the player looks at its crest
- **THEN** sand is carried off the crest by the wind

#### Scenario: An oasis holds water and palms

- **GIVEN** an oasis in the desert
- **WHEN** the player approaches it
- **THEN** the oasis holds water and palms

### Requirement: Rain falls in the rainforest and never in the desert

Rain SHALL fall in the rainforest as its regular weather, and SHALL NOT fall in the desert.

#### Scenario: Rain falls in the rainforest

- **GIVEN** a rainforest area with rain in its weather
- **WHEN** the rain comes
- **THEN** rain falls on the rainforest

#### Scenario: No rain falls in the desert

- **GIVEN** a desert area
- **WHEN** the weather changes
- **THEN** no rain falls

### Requirement: The Mausoleum of King Deshret and Khaj-Nisut stand as landmarks

The Mausoleum of King Deshret and Khaj-Nisut SHALL stand as landmarks visible from afar.

#### Scenario: The Mausoleum of King Deshret is visible from afar

- **GIVEN** the player some distance from the Mausoleum of King Deshret
- **WHEN** the player looks toward it
- **THEN** the Mausoleum stands in view as a landmark

### Requirement: Sumeru is all surface, listed by the game's area names

The Ashavan Realm and the Realm of Farakhkert SHALL be surface areas, and the world map SHALL list Sumeru's areas by the names the game gives them.

#### Scenario: The Ashavan Realm and the Realm of Farakhkert are surface areas

- **GIVEN** the Ashavan Realm and the Realm of Farakhkert
- **WHEN** the player opens the world map
- **THEN** each is shown as a surface area with no separate layer

#### Scenario: The world map lists Sumeru's areas by the game's names

- **GIVEN** the world map open on Sumeru
- **WHEN** the player reads the area names
- **THEN** each area is named as the game names it
