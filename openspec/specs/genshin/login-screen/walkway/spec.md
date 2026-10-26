## Purpose

The login walkway, as built: 23 pieces, each one outline, painted in the game's own tones and carved as its normal map carves it, assembling ahead of the glide so that its far end is built as the camera nears it.

## Requirements

### Requirement: Walkway built from 23 pieces

The walkway SHALL be 23 pieces, each its outline extruded from its underside up to its stone, with its curbs and lane borders raised over it (`packages/genshin-world/src/services/login/walkway/createLoginWalkwayPieces.ts`).

#### Scenario: Camera near the curbs

- **WHEN** the camera is near a piece
- **THEN** its curbs widen its outline and show their inner faces (`packages/genshin-world/src/services/login/walkway/createLoginWalkwayPieces.ts`)

### Requirement: Three paint tones

The walkway SHALL be painted in three tones read from the game's paving, the middle lane's paler bricks, the side lanes' and the wings' darker pockets, and the stone between them.

#### Scenario: Walkway is shown

- **WHEN** the walkway is shown
- **THEN** its paint reads in those three tones (`scripts/src/services/genshinAssets/fit/fitPlanTones.ts`, `packages/genshin-world/src/services/login/scene/createPlanCanvasNode.ts`)

### Requirement: Carving as depth

The walkway's pockets and joints SHALL be carved as depth that the scene's own light shades at every hour, with no dark line drawn over the paint (`packages/genshin-world/src/services/login/walkway/createLoginPaving.ts`).

#### Scenario: Low sun

- **WHEN** the sun is low
- **THEN** the rims of the pockets read as dark carving

### Requirement: Assembly ahead of the camera

Each piece SHALL rise from 3 metres down at 17.5 metres ahead of the camera, carry 0.45 metres past its place and settle into it by 13.5 metres, staggered by up to 2 metres of its neighbours, and a piece past the rise SHALL not stand at all (`packages/genshin-world/src/services/login/walkway/constants.ts`, `packages/genshin-world/src/services/login/walkway/getLoginWalkwaySink.ts`).

#### Scenario: Camera approaches the walkway

- **WHEN** the camera nears the walkway's far end
- **THEN** the pieces rise and settle in turn (`packages/genshin-world/src/services/login/walkway/getLoginWalkwaySink.ts`, `packages/genshin-world/src/services/login/walkway/constants.ts`)

#### Scenario: Piece past the rise

- **WHEN** a piece lies beyond the rise
- **THEN** it does not stand and casts no shadow (`packages/genshin-world/src/components/Login/Scene/Index.vue`)

#### Scenario: Walkway end is fixed

- **WHEN** the world has moved any distance
- **THEN** the walkway still ends a fixed distance ahead of the camera (`packages/genshin-world/src/services/login/walkway/constants.ts`)

## Open

- [ ] **The walkway is 23 pieces** — no source yet: the piece count is a fitted value in the hosted `login/walkway` record, which is not read here.
- [ ] **The rims of the pockets read as dark carving at low sun** — no source yet: no capture comparison of the carving is kept.
