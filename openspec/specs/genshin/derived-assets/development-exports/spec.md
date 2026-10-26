## Purpose

Under nuxt dev the development server serves the developer's own exports of the game's scenes from disk, and the world and the login scene draw them in place of our stand-ins of each family they hold. No build registers the route or holds a byte of them `apps/web/modules/serveGenshinExtractions.ts`.

## Requirements

### Requirement: The development world draws the developer's own exports in place of stand-ins

Under the local development server, the world SHALL draw the developer's own exported meshes and textures in place of its stand-ins for each family the developer's extraction holds.

#### Scenario: An exported family is drawn in development

- **GIVEN** the developer's extraction holding a family and the development server running
- **WHEN** the world loads
- **THEN** the exported family is drawn in place of the stand-in `packages/genshin-world/src/composables/useSceneExports.ts`

#### Scenario: A family with no export keeps its stand-in

- **GIVEN** the developer's extraction holding no export for a family
- **WHEN** the world loads
- **THEN** the stand-in for that family is drawn `packages/genshin-world/src/services/scene/loadSceneExport.ts`

### Requirement: A production build registers no export route and holds no export data

A production build SHALL register no export route, bundle no export handler and hand the world no export address.

#### Scenario: A production build draws only our stand-ins

- **GIVEN** a production build of the world
- **WHEN** it is loaded
- **THEN** the world draws only our stand-ins `apps/web/app/components/Genshin/Index.vue`
- **AND** it holds no export data

### Requirement: The export route answers only the components its index lists

The export route SHALL answer only with the components its index lists and with their root files (the layout, the avatar's manifest and binary) or files inside their asset folders, and SHALL answer not found for any other path.

#### Scenario: A path climbing out of a component's folder is not found

- **GIVEN** a request whose path climbs out of a component's folder
- **WHEN** the route answers it
- **THEN** the answer is not found `apps/web/server/services/genshin/sceneExport/serveGenshinSceneExport.ts`

#### Scenario: The index lists each folder that holds a layout or an avatar

- **GIVEN** the developer's exports folder with components that hold layouts or avatars
- **WHEN** the index is requested
- **THEN** each component holding a layout or an avatar is listed `apps/web/server/services/genshin/sceneExport/listSceneExportComponents.ts`

#### Scenario: A folder holding no layout or avatar is not found

- **GIVEN** a folder in the exports holding neither a layout nor an avatar
- **WHEN** it is requested
- **THEN** the answer is not found `apps/web/server/services/genshin/sceneExport/serveGenshinSceneExport.ts`

### Requirement: A scene draws only the families it names

A scene SHALL load and draw only the families it names, and SHALL fetch the meshes and textures of those families alone.

#### Scenario: A capital's exports load only the named families

- **GIVEN** a capital's exports holding many families
- **WHEN** the scene loads
- **THEN** only the meshes and textures of its named families are fetched `packages/genshin-world/src/services/scene/loadWitness.ts`

### Requirement: No scene waits on its exports

A scene SHALL NOT wait on its exports to be ready, and an export that fails to load SHALL be logged while the stand-ins stay in place.

#### Scenario: A scene shows its stand-ins while an export is still loading

- **GIVEN** an export still loading
- **WHEN** the scene is ready
- **THEN** the scene shows its stand-ins
- **AND** the export appears when it arrives `packages/genshin-world/src/composables/useSceneExports.ts`

#### Scenario: A failed export is logged and its stand-in stays

- **GIVEN** an export that fails to load
- **WHEN** the failure occurs
- **THEN** the failure is logged `packages/genshin-world/src/composables/useSceneExports.ts`
- **AND** the stand-in stays in place

### Requirement: A landmark an export stands in for stays mounted and hidden

A landmark within an exported family's extent that the export stands in for SHALL be hidden and SHALL stay mounted, so the body still collides with it.

#### Scenario: A landmark within an export's extent is hidden but still collides

- **GIVEN** a landmark standing within an exported family's extent
- **WHEN** the scene is drawn
- **THEN** the landmark is hidden `packages/genshin-world/src/services/world/getExportedLandmarkIds.ts`
- **AND** the body still collides with it

## Open

- [ ] **No production build holds a byte of the exports** — no source yet: no build output check is cited.
- [ ] **The body still collides with a landmark hidden for an export** — no source yet: no checked collider test or path is cited for it.
- [ ] **The body stands on our ground and collides with our stand-ins while exports are drawn** — no source yet: no checked test or code path is cited for it.

### Requirement: Collision and ground remain our own data

The body and the camera SHALL collide with our stand-ins and walk on our ground, whether or not exports are drawn.

#### Scenario: The body walks on our ground with exports drawn

- **GIVEN** the developer's exports drawn in the world
- **WHEN** the body walks
- **THEN** it stands on our ground
- **AND** it collides with our stand-ins
