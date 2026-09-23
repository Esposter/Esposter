import type { WorldPrompt } from "@/models/agentConsole/world/WorldPrompt";

import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { WorldObjectType } from "@/models/agentConsole/world/WorldObjectType";
import {
  COINS_POSITION,
  COINS_STAND_POSITION,
  DOOR_CLOSED_BOX,
  DOOR_STAND_POSITION,
  FIGURE_HALF_DEPTH,
  FIGURE_HALF_WIDTH,
  PAGES_POSITION,
  PAGES_STAND_POSITION,
  PLAYER_HEIGHT,
  VESSEL_HEIGHT,
  VESSEL_POSITION,
  VESSEL_STAND_POSITION,
} from "@/services/agentConsole/world/constants";
import { WorldObjectEntries } from "@/services/agentConsole/world/WorldObjectMap";
import { WorldObjectPanelTypeMap } from "@/services/agentConsole/world/WorldObjectPanelTypeMap";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAgentConsoleWorldStore } from "@/store/agentConsole/world";
// Everything in the room a player can use by standing at it, and what its key does: the board the sessions, a station
// The calls made at it, the gauges the usage and the changes, the gate the waiting request while one waits, the main
// Agent the composer, each also a tab or a button in the console, and the door opens or closes
export const useWorldPrompts = () => {
  const agentConsolePanelStore = useAgentConsolePanelStore();
  const { openConsole } = agentConsolePanelStore;
  const agentConsoleSessionStore = useAgentConsoleSessionStore();
  const { currentSessionId, pendingPermissionRequests, worldFigures } = storeToRefs(agentConsoleSessionStore);
  const agentConsoleWorldStore = useAgentConsoleWorldStore();
  const { isDoorOpen } = storeToRefs(agentConsoleWorldStore);
  return computed(() => {
    const objectPrompts = WorldObjectEntries.filter(
      ([worldObjectType]) => worldObjectType !== WorldObjectType.Gate || pendingPermissionRequests.value.length > 0,
    ).map(([worldObjectType, { boxes, promptTitle, standPosition }]): WorldPrompt => {
      const panelType = WorldObjectPanelTypeMap[worldObjectType];
      return {
        id: worldObjectType,
        max: [
          Math.max(...boxes.map(({ max }) => max[0])) + 1,
          Math.max(...boxes.map(({ max }) => max[1])) + 1,
          Math.max(...boxes.map(({ max }) => max[2])) + 1,
        ],
        min: [
          Math.min(...boxes.map(({ min }) => min[0])),
          Math.min(...boxes.map(({ min }) => min[1])),
          Math.min(...boxes.map(({ min }) => min[2])),
        ],
        run: () => openConsole(panelType, panelType === AgentConsolePanelType.Timeline ? worldObjectType : ""),
        standPosition,
        title: promptTitle,
      };
    });
    // The door is outlined in its opening whichever way it stands, so it is used from either side of the wall
    const worldPrompts: WorldPrompt[] = [
      ...objectPrompts,
      {
        id: "door",
        max: [DOOR_CLOSED_BOX.max[0] + 1, DOOR_CLOSED_BOX.max[1] + 1, DOOR_CLOSED_BOX.max[2] + 1],
        min: DOOR_CLOSED_BOX.min,
        run: () => {
          isDoorOpen.value = !isDoorOpen.value;
        },
        standPosition: DOOR_STAND_POSITION,
        title: isDoorOpen.value ? "Close" : "Open",
      },
    ];
    if (!currentSessionId.value) return worldPrompts;
    const openUsage = () => openConsole(AgentConsolePanelType.Usage);
    const mainFigure = worldFigures.value.find(({ isMain }) => isMain);
    return [
      ...worldPrompts,
      {
        id: "vessel",
        max: [VESSEL_POSITION.x + 1, VESSEL_POSITION.y + VESSEL_HEIGHT, VESSEL_POSITION.z + 1],
        min: VESSEL_POSITION.toArray(),
        run: openUsage,
        standPosition: VESSEL_STAND_POSITION,
        title: AgentConsolePanelType.Usage,
      },
      {
        id: "coins",
        max: [COINS_POSITION.x + 1, COINS_POSITION.y + 1, COINS_POSITION.z + 1],
        min: COINS_POSITION.toArray(),
        run: openUsage,
        standPosition: COINS_STAND_POSITION,
        title: AgentConsolePanelType.Usage,
      },
      {
        id: "pages",
        max: [PAGES_POSITION.x + 1, PAGES_POSITION.y + 1, PAGES_POSITION.z + 1],
        min: PAGES_POSITION.toArray(),
        run: () => openConsole(AgentConsolePanelType.Changes),
        standPosition: PAGES_STAND_POSITION,
        title: AgentConsolePanelType.Changes,
      },
      ...(mainFigure
        ? [
            {
              id: "main-agent",
              max: [
                mainFigure.position[0] + FIGURE_HALF_WIDTH,
                mainFigure.position[1] + PLAYER_HEIGHT,
                mainFigure.position[2] + FIGURE_HALF_DEPTH,
              ],
              min: [
                mainFigure.position[0] - FIGURE_HALF_WIDTH,
                mainFigure.position[1],
                mainFigure.position[2] - FIGURE_HALF_DEPTH,
              ],
              run: () => openConsole(AgentConsolePanelType.Conversation),
              standPosition: mainFigure.position,
              title: "Talk",
            } satisfies WorldPrompt,
          ]
        : []),
    ] satisfies WorldPrompt[];
  });
};
