## ADDED Requirements

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
