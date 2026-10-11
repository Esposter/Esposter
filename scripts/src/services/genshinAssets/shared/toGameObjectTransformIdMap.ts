import type { DumpedGameObject } from "#src/models/genshinAssets/shared/DumpedGameObject";

// Each game object's transform path ID by the game object's own path ID, where its dump names a transform: a game object's
// first component is its transform
export const toGameObjectTransformIdMap = (gameObjects: readonly DumpedGameObject[]): Map<string, string> =>
  new Map(
    gameObjects.flatMap(({ m_Components, m_Transform }) => {
      const transformId = m_Components[0]?.m_PathID;
      return transformId ? [[m_Transform.m_GameObject.m_PathID, transformId] as const] : [];
    }),
  );
