## Purpose

The game's tools are the widget config's entries: the Wind Catcher, the Treasure Compasses, the gather point finders and the devices, each a kind with its own cooldowns (`~/Esposter.noindex/genshin-parity/text/BinOutput/Widget/ConfigWidget.json`). This page is the first part of the gadgets proposal, its data and its cooldowns. Z is already bound to the quick-use gadget (`packages/genshin-engine/src/input/InputActionBindingMap.ts`), but nothing is equipped to it and nothing is used yet: the bag's items do not yet include the widget material type, so a gadget has no item to equip.

## Requirements

### Requirement: Gadgets are built as four kinds

The game's gadgets SHALL be built as four kinds: collectors, detectors, gather point finders and devices (`packages/genshin-world/src/models/gadget/GadgetKind.ts`).

#### Scenario: Widget of a built type becomes a gadget

- **GIVEN** a widget's type is collector, detector, gather point finder or device
- **WHEN** the gadget data is built
- **THEN** the widget is built as a gadget of that kind (`scripts/src/services/genshinAssets/gadgets/ConfigWidgetTypeGadgetKindMap.ts`, `scripts/src/services/genshinAssets/gadgets/toGadgetRows.ts`)

#### Scenario: Widget of another type is left out

- **GIVEN** a widget's type is a camera, an avatar attachment, a water sprite, an ability group or a toy
- **WHEN** the gadget data is built
- **THEN** the widget is left out of the gadgets (`scripts/src/services/genshinAssets/gadgets/toGadgetRows.ts`)

### Requirement: A gadget's cooldowns come from its configured values

A gadget SHALL start its configured cooldown after a use that works and its cooldown on a failed use after a use that fails, with an omitted value counting as zero (`packages/genshin-world/src/services/gadget/startGadgetCooldown.ts`, `scripts/src/services/genshinAssets/gadgets/toGadgetRows.ts`).

#### Scenario: Successful use starts the cooldown

- **GIVEN** a gadget with a cooldown is ready
- **WHEN** the player uses it and the use works
- **THEN** its cooldown starts (`packages/genshin-world/src/services/gadget/startGadgetCooldown.ts`)

#### Scenario: Failed use starts the failure cooldown

- **GIVEN** a gadget with a failure cooldown is ready
- **WHEN** the player uses it and the use fails
- **THEN** its failure cooldown starts (`packages/genshin-world/src/services/gadget/startGadgetCooldown.ts`)

#### Scenario: Collector with no failure cooldown has none

- **GIVEN** a collector gadget has no failure cooldown configured
- **WHEN** a use of it fails
- **THEN** no cooldown starts (`~/Esposter.noindex/genshin-parity/text/BinOutput/Widget/ConfigWidget.json`, the collector `220004`, and `packages/genshin-world/src/services/gadget/startGadgetCooldown.ts`)

### Requirement: A gadget is refused while its cooldown group is not ready

A gadget SHALL be refused use while its cooldown group is not yet ready, and SHALL be usable again once the group's ready moment has come (`packages/genshin-world/src/services/gadget/checkIsGadgetReady.ts`, `packages/genshin-world/src/services/gadget/quickUseGadget.ts`).

#### Scenario: Use during the cooldown is refused

- **GIVEN** a gadget's cooldown group is cooling
- **WHEN** the player uses the gadget
- **THEN** the use is refused until the group's ready moment (`packages/genshin-world/src/services/gadget/quickUseGadget.ts`)

#### Scenario: Use after the cooldown is accepted

- **GIVEN** a gadget's cooldown group's ready moment has come
- **WHEN** the player uses the gadget
- **THEN** the use is accepted (`packages/genshin-world/src/services/gadget/quickUseGadget.ts`)

### Requirement: Gadgets of one cooldown group share a cooldown

Gadgets in one cooldown group SHALL share their cooldown, and a gadget with no group SHALL keep its own cooldown apart from every other gadget (`packages/genshin-world/src/services/gadget/getCooldownGroup.ts`).

#### Scenario: Gadgets in one group share a cooldown

- **GIVEN** two gadgets belong to one cooldown group
- **WHEN** one of them is used
- **THEN** the other is also cooling until the group's ready moment (`packages/genshin-world/src/services/gadget/startGadgetCooldown.ts`, `packages/genshin-world/src/services/gadget/getCooldownGroup.ts`)

#### Scenario: Gadget with no group keeps its own cooldown

- **GIVEN** a gadget has no cooldown group
- **WHEN** another gadget is used
- **THEN** the gadget with no group is not affected (`packages/genshin-world/src/services/gadget/getCooldownGroup.ts`)

### Requirement: A cooldown keeps running while the world is paused

A cooldown SHALL keep counting down while the world is paused, as the game's do, since it is kept as a ready moment rather than ticked (`packages/genshin-world/src/services/gadget/checkIsGadgetReady.ts`).

#### Scenario: Cooldown started before a menu runs on while it is open

- **GIVEN** a cooldown started before the player opened a menu
- **WHEN** the menu is open and the ready moment comes
- **THEN** the gadget is ready once that moment has come (`packages/genshin-world/src/services/gadget/checkIsGadgetReady.ts`)

### Requirement: Gadgets are not yet equipped or used

Gadgets SHALL NOT yet be equipped to the quick-use key or used from the world.

#### Scenario: Quick-use key does nothing yet

- **GIVEN** no gadget is equipped
- **WHEN** the player presses the quick-use key
- **THEN** no gadget is used

## Open

- [ ] **A cooldown keeps counting down while the world is paused, as the game's do** — no source yet: the wiki's Gadget page is not in `~/Esposter.noindex/cache/genshin-wiki/`, so the game's pause rule is not checked.
