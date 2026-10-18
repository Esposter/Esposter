## Purpose

The dishes and processings of the game's cooking are rules over the game's own tables, and a campfire's lit state follows the elements and the weather. This page is the first build of the cooking proposal, covering its recipes, cooking by hand, proficiency, Auto Cook, specialties, processing and campfires. The stove opens the cooking and processing screens in the world session, and what a dish does once eaten is the inventory's.

## Requirements

### Requirement: Cooking by hand sets quality by where the indicator stops

A dish cooked by hand SHALL take the quality of the zone the indicator stops in, Delicious in the delicious zone, Regular in the regular zone and Suspicious anywhere else.

#### Scenario: A stop in the delicious zone makes a Delicious dish

- **GIVEN** a dish whose ingredients are in the bag
- **WHEN** the indicator stops in the delicious zone
- **THEN** a Delicious dish is put in the bag
- **AND** its ingredients are taken from the bag

#### Scenario: A stop in the regular zone makes a Regular dish

- **GIVEN** a dish whose ingredients are in the bag
- **WHEN** the indicator stops in the regular zone
- **THEN** a Regular dish is put in the bag

#### Scenario: A stop outside both zones makes a Suspicious dish

- **GIVEN** a dish whose ingredients are in the bag
- **WHEN** the indicator stops outside the delicious and regular zones
- **THEN** a Suspicious dish is put in the bag

#### Scenario: Leaving the minigame spends nothing

- **GIVEN** a dish whose ingredients are in the bag
- **WHEN** the player leaves the minigame before it stops
- **THEN** no ingredient is spent
- **AND** no dish is made

### Requirement: The indicator's pointer sweeps along its bar

The pointer of the cooking indicator SHALL swing from one end of its bar to the other and back at a set speed while the cooking screen is open, and a stop SHALL cook where the pointer stands at the press.

#### Scenario: The indicator sweeps from one end of its bar to the other and back

- **GIVEN** the cooking screen is open
- **WHEN** time passes
- **THEN** the pointer swings from the left end to the right end and back at the sweep time

#### Scenario: A time before the start stands the indicator at the left end

- **GIVEN** the cooking screen has not been opened
- **WHEN** the pointer is read
- **THEN** it stands at the left end

### Requirement: A Delicious dish adds one proficiency up to its maximum

A Delicious dish SHALL add one proficiency to its dish, up to the dish's maximum, its special dish included.

#### Scenario: A Delicious dish adds a proficiency point

- **GIVEN** a dish below its maximum proficiency
- **WHEN** a Delicious dish of it is cooked
- **THEN** its proficiency rises by one

#### Scenario: A Delicious dish at maximum proficiency adds nothing

- **GIVEN** a dish at its maximum proficiency
- **WHEN** a Delicious dish of it is cooked
- **THEN** its proficiency stays at the maximum

### Requirement: A dish is cookable once it is known

A dish SHALL be cookable only once it is known, either from the start or after one of its instruction items is used.

#### Scenario: Using an instruction teaches its dish

- **GIVEN** a dish that is not known and its instruction item in the bag
- **WHEN** the instruction item is used
- **THEN** the dish becomes known
- **AND** the instruction item is taken from the bag

#### Scenario: An unknown dish is not cooked

- **GIVEN** a dish that is not known and no instruction used
- **WHEN** the player asks to cook it
- **THEN** the dish is not cooked

### Requirement: Auto Cook makes a whole batch of Delicious dishes once proficiency is full

Once a dish's proficiency is full, Auto Cook SHALL make up to 99 dishes in one batch, every one Delicious, or refuse the whole batch.

#### Scenario: Auto Cook makes as many dishes as the ingredients allow

- **GIVEN** a dish at full proficiency and ingredients in the bag
- **WHEN** Auto Cook runs
- **THEN** as many Delicious dishes as the ingredients allow, up to 99, are put in the bag

#### Scenario: Auto Cook refuses a batch the bag has no room for

- **GIVEN** a dish at full proficiency and no room in the bag for every dish
- **WHEN** Auto Cook runs
- **THEN** the batch is refused

#### Scenario: Auto Cook makes no batch before proficiency is full

- **GIVEN** a dish whose proficiency is not yet full
- **WHEN** Auto Cook is asked to run
- **THEN** no batch is made

### Requirement: A specialty may replace a result with its character's special dish

A character named in a dish's specialties SHALL have their special dish made in place of the result at that quality's chance.

#### Scenario: A roll under the chance makes the special dish

- **GIVEN** a dish naming a character as a specialty
- **WHEN** the roll falls under that character's chance for the quality cooked
- **THEN** their special dish is made in place of the result

#### Scenario: A roll over the chance makes the quality's own result

- **GIVEN** a dish naming a character as a specialty
- **WHEN** the roll does not fall under that character's chance for the quality cooked
- **THEN** the quality's own result is made

### Requirement: No dish is made with Raiden Shogun

The cooking SHALL make no dish with Raiden Shogun, by hand or by Auto Cook.

#### Scenario: A dish naming Raiden Shogun makes no dish with her

- **GIVEN** a dish naming Raiden Shogun as a specialty
- **WHEN** it is cooked by hand or by Auto Cook
- **THEN** no dish is made with her

### Requirement: A processing takes its ingredients when a unit is queued

A processing SHALL take the ingredients of each unit when the unit is queued, and SHALL run its units one after another, each taking its table's seconds.

#### Scenario: A unit queued on an idle processing starts at once

- **GIVEN** an idle processing with its ingredients in the bag
- **WHEN** a unit is queued
- **THEN** the unit's ingredients are taken from the bag
- **AND** the unit starts at the moment it is queued

#### Scenario: A unit queued behind a running one waits its turn

- **GIVEN** a processing with a unit still running
- **WHEN** another unit is queued
- **THEN** the new unit runs after the units already queued

### Requirement: Finished processing units collect into the bag together

Each processing unit that is done by a moment SHALL be put into the bag together, and a unit whose result the bag has no room for SHALL wait in the queue with the units behind it.

#### Scenario: Units done by a moment are put into the bag

- **GIVEN** processing units whose seconds have passed
- **WHEN** the moment is read
- **THEN** their results are put into the bag together

#### Scenario: A unit with no room in the bag waits in the queue

- **GIVEN** a finished unit whose result the bag has no room for
- **WHEN** the moment is read
- **THEN** the unit stays in the queue
- **AND** the units behind it stay in the queue

### Requirement: A processing queues no more units than its queue size

A processing SHALL hold no more queued units than its queue size allows.

#### Scenario: A unit beyond the queue size is refused

- **GIVEN** a processing whose queue is at its size
- **WHEN** another unit is asked to be queued
- **THEN** the unit is refused

### Requirement: A processing not known from the start is refused until it is known

A processing SHALL be queued only once it is known.

#### Scenario: An unknown processing is refused

- **GIVEN** a processing that is not known from the start
- **WHEN** a unit of it is asked to be queued
- **THEN** the unit is refused

### Requirement: A stove offers its cooking and its processing beside it

A city's stove SHALL offer the cooking screen and the processing screen as two rows of the prompts at its place, and a city with no stove SHALL offer neither.

#### Scenario: A city stove cooks where a campfire would be out

- **GIVEN** a city with a stove in its scene group record
- **WHEN** the player stands within reach of the stove
- **THEN** the stove's cooking row is offered, with no campfire needed

#### Scenario: A stove offers processing beside cooking

- **GIVEN** a city with a stove
- **WHEN** the player stands within reach of the stove
- **THEN** the processing row is offered beside the cooking row

#### Scenario: A city with no stove offers none

- **GIVEN** a city with no stove in its scene group record
- **WHEN** the prompts are computed
- **THEN** no stove row is offered

#### Scenario: A stove offers no prompt out of reach

- **GIVEN** a city with a stove
- **WHEN** the player stands beyond the interaction reach
- **THEN** no stove row is offered

### Requirement: Pyro lights a campfire and the other elements put it out

A campfire SHALL be lit by Pyro, put out by Anemo, Cryo, Electro, Geo and Hydro, and left as it was by Dendro.

#### Scenario: Pyro lights an unlit campfire

- **GIVEN** an unlit campfire
- **WHEN** Pyro is applied to it
- **THEN** it is lit

#### Scenario: Hydro puts out a lit campfire

- **GIVEN** a lit campfire
- **WHEN** Hydro is applied to it
- **THEN** it is put out

#### Scenario: Dendro leaves a campfire as it was

- **GIVEN** a lit campfire
- **WHEN** Dendro is applied to it
- **THEN** it stays lit

### Requirement: Rain puts out a campfire in the open

A campfire in the open SHALL be put out by rain and by thunderstorms.

#### Scenario: Rain puts out an open campfire

- **GIVEN** a lit campfire in the open
- **WHEN** rain begins
- **THEN** the campfire is put out

### Requirement: The recipes are the game's own and an unpredictable processing is left out

The dish and processing recipes SHALL be built from the game's own tables, and a processing whose result is drawn from a drop table SHALL be left out.

#### Scenario: A processing with a random result is left out of the record

- **GIVEN** a processing whose result is drawn from a drop table
- **WHEN** the processing record is built
- **THEN** that processing is left out of the record

### Requirement: City stoves cook on every use

A city's stove SHALL open the cooking screen whenever a player uses it, whether or not any fire is lit.

#### Scenario: A city stove cooks where a campfire would be out

- **GIVEN** a campfire nearby is out
- **WHEN** the player uses the city's stove
- **THEN** the cooking screen opens

### Requirement: Cooking indicator zones follow each recipe

The cooking screen SHALL lay out its indicator zones from the zone parameters of the recipe being cooked.

#### Scenario: Two recipes with different zone parameters lay out different zones

- **GIVEN** two recipes whose zone parameters differ
- **WHEN** the player cooks each by hand
- **THEN** each indicator shows its zones laid out from its own recipe's parameters

### Requirement: Eating a dish applies its effect

Eating a dish SHALL apply the dish's heal, revive or bonus to the party as the dish's item states.

#### Scenario: A heal dish heals the one who eats it

- **WHEN** the player eats a heal dish
- **THEN** the eater's health rises by the dish's heal

#### Scenario: A revive dish revives a fallen party member

- **GIVEN** a party member has fallen
- **WHEN** the player eats a revive dish on that member
- **THEN** the member is revived

#### Scenario: A bonus dish lasts as its description says

- **WHEN** the player eats a bonus dish
- **THEN** the bonus applies for the duration its description states

### Requirement: A passive bonuses its kind of dish

A cook's passive SHALL bonus each dish the cook makes whose food type matches the passive's food type.

#### Scenario: A dish of the passive's food type is bonused

- **GIVEN** a cook whose passive names heal dishes
- **WHEN** the cook makes a heal dish
- **THEN** the dish's bonus applies

#### Scenario: A dish of another food type is left unbonused

- **GIVEN** a cook whose passive names heal dishes
- **WHEN** the cook makes an attack dish
- **THEN** no bonus from that passive applies

### Requirement: A cooking talent adds a dish by chance

A cook's cooking talent SHALL add one more dish of the recipe when its chance draw succeeds.

#### Scenario: A perfect cook doubles a delicious dish

- **GIVEN** Xiangling cooks a Delicious attack dish by hand
- **WHEN** the talent's draw falls under 12 percent
- **THEN** the bag gains a second dish of that recipe

#### Scenario: A talent does not add a dish above its chance

- **GIVEN** Xiangling cooks a Delicious attack dish by hand
- **WHEN** the talent's draw falls above 12 percent
- **THEN** the bag gains only the one dish cooked

#### Scenario: A suspicious-dish talent adds a dish on any food type

- **GIVEN** Hu Tao cooks a Suspicious dish
- **WHEN** the talent's draw falls under 18 percent
- **THEN** the bag gains a second dish of that recipe

#### Scenario: Auto Cook draws the talent once for each dish

- **GIVEN** a cook with a cooking talent starts Auto Cook for a batch of dishes
- **WHEN** each dish is made
- **THEN** the talent is drawn once for that dish

#### Scenario: A talent's extra dish is refused when the bag has no room for it

- **GIVEN** the bag has room for one dish only
- **WHEN** a draw would double the dish being cooked
- **THEN** the cook is refused, because the room check counts the extra dish
