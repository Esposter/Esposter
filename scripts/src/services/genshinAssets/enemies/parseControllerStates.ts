import type { ControllerState } from "#src/models/genshinAssets/enemies/ControllerState";
import type { ExportedAnimatorController } from "#src/models/genshinAssets/enemies/ExportedAnimatorController";

import { readPathIdText } from "#src/services/genshinAssets/enemies/readPathIdText";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The states of every state machine in an Animator controller's JSON export, in the order the controller lists them,
// Each with the path IDs of the clips its blend tree nodes index. Refuses an export without `m_Controller`, which the
// Stock CLI does not write, so a stale CLI is named rather than read as a controller with no states
export const parseControllerStates = (controllerJson: string): ControllerState[] => {
  const { m_AnimationClips, m_Controller, m_TOS } = parseMachineJson<ExportedAnimatorController>(
    controllerJson,
    readPathIdText,
  );
  if (m_Controller === undefined)
    throw new InvalidOperationError(Operation.Read, "AnimatorController", "has no m_Controller in its export");
  return m_Controller.m_StateMachineArray.flatMap(({ m_StateConstantArray }) =>
    m_StateConstantArray.map((state) => {
      const name = m_TOS[String(state.m_NameID)];
      if (name === undefined) throw new InvalidOperationError(Operation.Read, String(state.m_NameID), "names no state");
      // A node naming no clip holds an index past the clip list, the unsigned maximum among them
      const clipPathIds = state.m_BlendTreeConstantArray.flatMap(({ m_NodeArray }) =>
        m_NodeArray.flatMap(({ m_ClipID }) => {
          const clip = m_AnimationClips[m_ClipID];
          return clip === undefined ? [] : [clip.m_PathID];
        }),
      );
      return { clipPathIds: [...new Set(clipPathIds)], name };
    }),
  );
};
