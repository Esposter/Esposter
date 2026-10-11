import type { DumpedGameObject } from "#src/models/genshinAssets/shared/DumpedGameObject";

// Each game object's named components by the game object's own path ID, its transform left out. A component the dump
// leaves unnamed (a CanvasRenderer) says nothing a layout needs
export const toGameObjectComponentsMap = (gameObjects: readonly DumpedGameObject[]): Map<string, string[]> =>
  new Map(
    gameObjects.map(({ m_Components, m_Transform }) => [
      m_Transform.m_GameObject.m_PathID,
      m_Components.slice(1).flatMap(({ Name }) => (Name ? [Name] : [])),
    ]),
  );
