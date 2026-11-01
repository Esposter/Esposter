## Purpose

The official map's fleeing birds and beasts, the White Pigeon, the Crimson Fox and the Squirrel, fitted into each region's slice of the game data and stood in Windrise's scene, each running from the character when it comes within its escape radius. Striking them and their drops is built, as is picking up a material source, a point such as a crystalfly that is not an animal (`packages/genshin-world/src/services/kit/strikeKitEnemies.ts`, line 221; `packages/genshin-world/src/services/wildlife/pickUpMaterialSource.ts`); only the boar's drop waits, on the wiki's entry for the boar (`packages/genshin-world/src/services/wildlife/WildlifeKindDropMap.ts`, lines 5 to 7).

## Requirements

### Requirement: Fleeing animals placed where the official map marks them

The White Pigeon, the Crimson Fox and the Squirrel SHALL be placed at the places the official map marks them on the ground of a mapped region, and the Boar SHALL be placed at the places the official map marks it too.

#### Scenario: Fleeing kind on the ground

- **GIVEN** the official map marks a Squirrel on the ground of a mapped region
- **WHEN** the animals are placed
- **THEN** the Squirrel is placed at its marked place

#### Scenario: Underground animal left out

- **GIVEN** the official map marks a fleeing animal on a floor below the ground
- **WHEN** the animals are placed
- **THEN** that animal is left out

#### Scenario: Animal that does not flee is placed too

- **GIVEN** the official map marks an animal that is not a fleeing kind
- **WHEN** the animals are placed
- **THEN** that animal is placed at its marked place

### Requirement: Animal runs from the character within its escape radius

An animal SHALL run straight away from the character when the character comes within four metres of it (`WILDLIFE_ESCAPE_RADIUS` of 4).

#### Scenario: Character comes near

- **GIVEN** an idle animal stands in Windrise's scene
- **WHEN** the character comes within four metres of it
- **THEN** the animal runs straight away from the character

#### Scenario: Escape time passes

- **GIVEN** an animal is running from the character
- **WHEN** one second has passed (`WILDLIFE_ESCAPE_SECONDS` of 1)
- **THEN** the animal stands idle at its place
- **AND** it runs again only if the character is still within reach

#### Scenario: Character gone

- **GIVEN** an animal is running and the character has gone
- **WHEN** the animal's escape time runs out
- **THEN** the animal keeps running on its last heading until then
- **AND** it then stands idle

### Requirement: Every animal of the slice exists from the scene's load

Every animal of Mondstadt's slice SHALL exist in Windrise's scene from the scene's load.

#### Scenario: Animals present on load

- **GIVEN** Mondstadt's slice holds about a hundred animals
- **WHEN** Windrise's scene loads
- **THEN** every one of those animals is present in the scene

### Requirement: Struck animals fall and give their drops

Striking an animal SHALL make it fall and give its drop where it fell: a Crimson Fox two Raw Meat, a Squirrel one Raw Meat and a White Pigeon one Fowl. A Boar SHALL give nothing until its drop is read. An animal SHALL offer no material source.

#### Scenario: Striking an animal

- **GIVEN** an animal stands in Windrise's scene
- **WHEN** the player strikes it with an area hit that reaches it (`packages/genshin-world/src/services/kit/strikeKitEnemies.ts`, line 220)
- **THEN** it falls and gives its drop where it fell (`packages/genshin-world/src/services/wildlife/strikeKitWildlife.ts`, lines 20 to 25; `packages/genshin-world/src/services/wildlife/WildlifeKindDropMap.ts`, lines 9 to 11)
- **AND** no material source appears
- **AND** striking it again gives nothing (`packages/genshin-world/src/services/wildlife/strikeWildlife.ts`, line 10)

## Open

- [ ] **An animal under the ground is left out** — no source yet: an animal point marked below the ground in `{data-root}/genshin-parity/references/interactive-map/points.json`, which the scenario's given needs and which that file does not hold on another layer.
- [ ] **Mondstadt's slice holds about a hundred animals** — no source yet: the published Mondstadt slice, which is in hosted storage and not on disk, is not counted against the map's animal points in `{data-root}/genshin-parity/references/interactive-map/points.json`.
- [ ] **The White Pigeon, the Crimson Fox and the Squirrel are placed where the official map marks them** — no source yet: the published Mondstadt slice's placements, which are not set against the map's animal points in `{data-root}/genshin-parity/references/interactive-map/points.json`, since the slice is in hosted storage and not on disk.
