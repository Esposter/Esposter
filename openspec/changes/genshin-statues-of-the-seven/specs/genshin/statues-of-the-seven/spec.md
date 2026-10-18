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

### Requirement: A found Oculus is held until the Worship Statue offers it

A found Oculus SHALL be held in its region's count, and the Worship Statue's offer SHALL reach each level the region's held Oculi complete.

#### Scenario: A found Oculus waits for the Worship Statue's offer

- **GIVEN** a region started at a level
- **WHEN** the player finds an Oculus in the region
- **THEN** the Oculus is held in the region's count
- **AND** no level is reached

#### Scenario: An offer reaches the levels the held Oculi complete

- **GIVEN** a region started at a level, holding the Oculi its next level takes
- **WHEN** the player offers the Oculi at the Worship Statue
- **THEN** the region reaches that level
- **AND** the level's rewards wait to be claimed

#### Scenario: An Oculus found in an unstarted region is held until the region starts

- **GIVEN** a region that no statue has been resonated in
- **WHEN** the player finds an Oculus in the region
- **THEN** the Oculus is held in the region's count
- **AND** no level is reached

### Requirement: A first resonance starts a region at level one, reached and not yet paid

A first resonance with one of a region's statues SHALL start the region at level one, which SHALL be reached, its rewards left to be claimed.

#### Scenario: The first resonance starts the region at level one

- **GIVEN** a region no statue has been resonated in
- **WHEN** the player resonates with one of its statues
- **THEN** the region starts at level one
- **AND** level one's rewards wait to be claimed
- **AND** the Oculi the region holds stay held

#### Scenario: A second resonance changes nothing

- **GIVEN** a region already started
- **WHEN** the player resonates with another of its statues
- **THEN** no level is reached or paid

### Requirement: The Worship Statue claims one reached level per action

Each claim at the Worship Statue SHALL take the next level the region has reached and not yet claimed, paying that level's rewards once, so one claim takes one level.

#### Scenario: A claim pays the next reached level

- **GIVEN** a region that has reached two levels and claimed none
- **WHEN** the player claims at the Worship Statue
- **THEN** the first level's rewards are paid
- **AND** the second level remains to be claimed

#### Scenario: A claim with every reached level claimed pays nothing

- **GIVEN** a region whose reached levels are all claimed
- **WHEN** the player claims at the Worship Statue
- **THEN** nothing is paid

### Requirement: Each claimed level pays the rewards its region gives

Each level of a region, when claimed, SHALL pay Adventure EXP, Primogems and Sigils everywhere, and the rewards its own region gives.

#### Scenario: Every region's level pays Adventure EXP, Primogems and Sigils

- **GIVEN** a region with a reached level not yet claimed
- **WHEN** the player claims that level
- **THEN** the player gains the level's Adventure EXP, Primogems and Sigils

#### Scenario: Liyue's level also pays its Stones of Remembrance

- **GIVEN** a Liyue statue with a reached level not yet claimed
- **WHEN** the player claims that level
- **THEN** the player gains that level's Stones of Remembrance

### Requirement: The Traveler takes the element of the statue's region on resonance

Resonating with a statue SHALL change the Traveler's element to the element of the statue's region, and the constellations of that element SHALL come with the Traveler's levels.

#### Scenario: Resonating with a Liyue statue makes the Traveler Geo

- **GIVEN** the Traveler and a Liyue statue
- **WHEN** the player resonates with the statue
- **THEN** the Traveler's element is Geo

### Requirement: F on a resonated statue opens the Worship Statue

Pressing F at a resonated statue SHALL open the Worship Statue, which shows each level of the region and what each pays, and the Statue's Blessing SHALL be one switch away from it. The Statue's Blessing SHALL show the healing pool and the party's portraits.

#### Scenario: F on a resonated statue opens the Worship Statue

- **GIVEN** a resonated statue
- **WHEN** the player presses F at the statue
- **THEN** the Worship Statue opens
- **AND** it shows each level of the region and what each pays

#### Scenario: The Statue's Blessing opens from the Worship Statue

- **GIVEN** the Worship Statue open
- **WHEN** the player switches to the Statue's Blessing
- **THEN** the Statue's Blessing opens
- **AND** it shows the healing pool and the party's portraits

### Requirement: The statues' state is kept with the world and merged between saves

The statues' levels, levels claimed, held counts and found Oculi SHALL be kept with the world, and a merge of two saves SHALL keep the union of both saves' found Oculi, with each region the save further on by its level, then its held count, and each region's level claimed taken from the account's copy, so a level only the guest's copy claimed is claimed again on the account.

#### Scenario: A new player starts with no region started and no Oculus found

- **GIVEN** a new player's save
- **WHEN** the world opens
- **THEN** no region is started and no Oculus is found

#### Scenario: Merged saves keep every found Oculus

- **GIVEN** a guest save and an account save with different found Oculi
- **WHEN** the two saves are merged
- **THEN** the merged save holds every Oculus either save found

#### Scenario: A region only one save holds is kept as it is

- **GIVEN** a region one save holds and the other does not
- **WHEN** the two saves are merged
- **THEN** the merged save holds that region as it is

#### Scenario: A region both saves hold is the save further on

- **GIVEN** a region both saves hold, one of them further on by its level, or on the same level by the Oculi it holds
- **WHEN** the two saves are merged
- **THEN** the merged save holds the region of the save further on, its level and held count as they are, with the account's level claimed

#### Scenario: A level the account claimed is kept when the copy further on has claimed none

- **GIVEN** the account has claimed a level of a region, and the save further on has claimed no level of it
- **WHEN** the two saves are merged
- **THEN** the merged save keeps the level claimed, so its rewards are not paid again

#### Scenario: A level only the guest claimed is claimed again on the account

- **GIVEN** the guest has claimed a level of a region, its rewards paid into the guest's bag, and the account has not claimed it
- **WHEN** the two saves are merged
- **THEN** the merged save claims none of that level, so the account claims it again and is paid once from its own bag
- **AND** the guest's rewards for it are lost with the guest's bag

## MODIFIED Requirements

### Requirement: A click heals a tenth of a member's maximum HP from the pool

A click on a party member's portrait in the Statue's Blessing SHALL heal a standing party member who is hurt by a tenth of their maximum HP, paid from the pool, and SHALL heal nothing for a fallen member or a member at full HP.

#### Scenario: Pool covers the full heal

- **GIVEN** the Statue's Blessing open, a hurt standing party member and a pool holding at least a tenth of their maximum HP
- **WHEN** the member's portrait is clicked
- **THEN** the member is healed by a tenth of their maximum HP
- **AND** that amount is taken from the pool

#### Scenario: Pool runs short

- **GIVEN** the Statue's Blessing open, a hurt standing party member and a pool holding less than a tenth of their maximum HP
- **WHEN** the member's portrait is clicked
- **THEN** the member is healed by what the pool holds
- **AND** the pool is emptied

#### Scenario: Fallen member not healed by a click

- **GIVEN** the Statue's Blessing open and a fallen party member
- **WHEN** the member's portrait is clicked
- **THEN** the member is not healed
- **AND** the pool is unchanged

### Requirement: Auto-recover revives the fallen and heals the hurt to a threshold

With auto-recover on and a threshold set, standing by a statue for two seconds SHALL revive the deployed team's fallen members at thirty-five percent of their HP at no cost to the pool, and then SHALL heal every member under the threshold up to that threshold from the pool, slot by slot.

#### Scenario: Standing by a statue for two seconds revives the fallen

- **GIVEN** a fallen party member and auto-recover on near a statue
- **WHEN** the player stands by the statue for two seconds
- **THEN** the fallen member is revived at thirty-five percent of health
- **AND** the pool is unchanged by the revival

#### Scenario: Members under the threshold are healed when the pool holds enough

- **GIVEN** party members under the threshold and a pool that holds enough to heal them
- **WHEN** the player stands by the statue for two seconds
- **THEN** every member under the threshold is healed to it

#### Scenario: A pool short of the threshold heals the first slots first

- **GIVEN** party members under the threshold and a pool that holds too little to heal them all
- **WHEN** the player stands by the statue for two seconds
- **THEN** the first slots are healed first
- **AND** the later slots stay where they stand
- **AND** the pool is empty

## REMOVED Requirements

### Requirement: Statues stay jumps until the world wires them

The world holds each region's level and the pool, so a resonated statue opens the Blessing rather than only jumping.
