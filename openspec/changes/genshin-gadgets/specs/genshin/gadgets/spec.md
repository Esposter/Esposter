## ADDED Requirements

### Requirement: Each gadget appears in the bag's gadget tab

Each gadget the game holds SHALL appear in the bag's gadget tab as a material.

#### Scenario: A gadget appears in the gadget tab

- **GIVEN** the player holds a gadget
- **WHEN** the player opens the bag's gadget tab
- **THEN** the gadget is listed in that tab

### Requirement: Only an equipable gadget is equipped to the quick-use slot

Equipping a gadget to the quick-use slot SHALL be allowed only for a gadget the game marks as equipable.

#### Scenario: An equipable gadget is equipped from its tab

- **GIVEN** the player holds an equipable gadget
- **WHEN** the player equips it from the gadget tab
- **THEN** the gadget is the one equipped to the quick-use slot

#### Scenario: A gadget the game does not mark equipable is refused

- **GIVEN** the player holds a gadget the game does not mark equipable
- **WHEN** the player tries to equip it
- **THEN** the equip is refused and the slot is unchanged

### Requirement: Z uses the equipped gadget when its cooldown is ready

Pressing Z SHALL use the equipped gadget when its cooldown group is ready, and SHALL do nothing while it is cooling down.

#### Scenario: Z uses the equipped gadget

- **GIVEN** a gadget is equipped and its cooldown is ready
- **WHEN** the player taps Z, releasing it before the quick swap's hold
- **THEN** the gadget is used and its cooldown starts

#### Scenario: Z does nothing while the gadget's cooldown runs

- **GIVEN** a gadget is equipped and still cooling down
- **WHEN** the player taps Z, releasing it before the quick swap's hold
- **THEN** the gadget is not used and the HUD shows its cooldown

### Requirement: A detector points to the nearest of what it finds in its city

A detector SHALL point to the nearest thing of its kind in its city, a Treasure Compass to a treasure box and a Seelie detector to a Seelie crystal.

#### Scenario: A compass points to the nearest box in its city

- **GIVEN** the player uses a Treasure Compass in a city with treasure boxes
- **WHEN** the compass is used
- **THEN** it points to the nearest treasure box in that city

#### Scenario: A Seelie detector points to the nearest crystal in its city

- **GIVEN** the player uses a Seelie detector in a city with Seelie crystals
- **WHEN** the detector is used
- **THEN** it points to the nearest Seelie crystal in that city

### Requirement: Holding Z opens a quick swap of up to four gadgets

Holding Z SHALL open a quick swap of up to four gadgets chosen from the bag.

#### Scenario: Holding Z opens the quick swap

- **GIVEN** the player has gadgets to swap
- **WHEN** the player holds Z
- **THEN** the quick swap opens with the chosen gadgets

#### Scenario: The quick swap does not hold a fifth gadget

- **GIVEN** the quick swap already holds four gadgets
- **WHEN** the player chooses a fifth gadget
- **THEN** the fifth gadget is not added to the quick swap
