## ADDED Requirements

### Requirement: An Oculus is collected once by touching it

An Oculus SHALL be collected by the player touching it, giving its kind and Adventure EXP, and a collected Oculus SHALL NOT come back.

#### Scenario: Touching an Oculus collects it and gives Adventure EXP

- **GIVEN** an Oculus in a region not yet collected
- **WHEN** the player touches it
- **THEN** the player gains one Oculus of its kind
- **AND** the player gains its Adventure EXP

#### Scenario: A collected Oculus does not come back

- **GIVEN** an Oculus the player has collected
- **WHEN** the player returns to its place
- **THEN** the Oculus is not there

### Requirement: A near Oculus shows on the minimap with a sound

An Oculus within a short distance of the player SHALL show on the minimap and sound a signal.

#### Scenario: A near Oculus shows on the minimap with a sound

- **GIVEN** an Oculus within the short distance of the player
- **WHEN** the player is in that distance
- **THEN** the Oculus shows on the minimap
- **AND** a sound signals it

### Requirement: A found Oculus is offered to its region at once

A found Oculus SHALL be offered to its region at once, and any level it completes SHALL be reached and paid then.

#### Scenario: An offered Oculus completes a level at once

- **GIVEN** a region started at a level whose next level its offered Oculi complete
- **WHEN** the player finds an Oculus in the region
- **THEN** the region's statues reach the next level
- **AND** that level's rewards are paid

#### Scenario: An Oculus found in an unstarted region is held until the region starts

- **GIVEN** a region that no statue has been resonated in
- **WHEN** the player finds an Oculus in the region
- **THEN** the Oculus is held in the region's count
- **AND** no level is reached

### Requirement: A region starts at level one on its first resonance

A region SHALL start at level one on the first resonance with one of its statues and pay level one's rewards once.

#### Scenario: The first resonance starts the region at level one

- **GIVEN** a region no statue has been resonated in
- **WHEN** the player resonates with one of its statues
- **THEN** the region starts at level one
- **AND** level one's rewards are paid

#### Scenario: A second resonance pays no reward again

- **GIVEN** a region already started
- **WHEN** the player resonates with another of its statues
- **THEN** no reward is paid

### Requirement: Each level pays the rewards its region gives

Each level of a region SHALL pay Adventure EXP, Primogems and Sigils everywhere, and the rewards its own region gives.

#### Scenario: Every region's level pays Adventure EXP, Primogems and Sigils

- **GIVEN** a region reaching a level
- **WHEN** the level is reached
- **THEN** the player gains the level's Adventure EXP, Primogems and Sigils

#### Scenario: Liyue's level also pays its Stones of Remembrance

- **GIVEN** a Liyue statue reaching a level
- **WHEN** the level is reached
- **THEN** the player gains that level's Stones of Remembrance

### Requirement: The Traveler takes the element of the statue's region on resonance

Resonating with a statue SHALL change the Traveler's element to the element of the statue's region, and the constellations of that element SHALL come with the Traveler's levels.

#### Scenario: Resonating with a Liyue statue makes the Traveler Geo

- **GIVEN** the Traveler and a Liyue statue
- **WHEN** the player resonates with the statue
- **THEN** the Traveler's element is Geo

### Requirement: F on a resonated statue opens the Statue's Blessing

Pressing F at a resonated statue SHALL open the Statue's Blessing, which shows the healing pool, the party's portraits and the auto-recover switch and threshold.

#### Scenario: F on a resonated statue opens the Blessing screen

- **GIVEN** a resonated statue and a party
- **WHEN** the player presses F at the statue
- **THEN** the Statue's Blessing opens
- **AND** it shows the healing pool, the party's portraits and the auto-recover switch and threshold

### Requirement: Auto-recover revives and heals the party near a statue

With auto-recover on and a threshold set, standing by a statue for two seconds SHALL revive the fallen and heal members under the threshold from the healing pool.

#### Scenario: Standing by a statue for two seconds revives the fallen

- **GIVEN** a fallen party member and auto-recover on near a statue
- **WHEN** the player stands by the statue for two seconds
- **THEN** the fallen member is revived at thirty-five percent of health

#### Scenario: Members under the threshold are healed when the pool holds enough

- **GIVEN** party members under the threshold and a pool that holds enough to heal them
- **WHEN** the player stands by the statue for two seconds
- **THEN** every member under the threshold is healed to it

#### Scenario: A pool short of the threshold heals the first slots first

- **GIVEN** party members under the threshold and a pool that holds too little to heal them all
- **WHEN** the player stands by the statue for two seconds
- **THEN** the first slots are healed first
- **AND** the pool is empty

### Requirement: The statues' state is kept with the world and merged between saves

The statues' levels, held counts and found Oculi SHALL be kept with the world, and a merge of two saves SHALL keep every found Oculus and offer the held Oculi of each region a copy started.

#### Scenario: A new player starts with no region started and no Oculus found

- **GIVEN** a new player's save
- **WHEN** the world opens
- **THEN** no region is started and no Oculus is found

#### Scenario: Merged saves keep every found Oculus

- **GIVEN** a guest save and an account save with different found Oculi
- **WHEN** the two saves are merged
- **THEN** the merged save holds every Oculus either save found

#### Scenario: A region a copy started takes its Oculi offered from level one

- **GIVEN** a region started in one save and not in the other, with Oculi found in the region by either save
- **WHEN** the two saves are merged
- **THEN** the started region offers those Oculi from level one
- **AND** any level the offered Oculi reach pays no reward
