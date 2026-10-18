import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";
import type { ViewerLink } from "#src/models/ViewerLink";
import type { ViewerPlayer } from "#src/services/createViewerPlayer";

export interface ViewerOpenerDependencies {
  connect: (address: string) => Promise<ViewerLink | undefined>;
  createPlayer: (link: ViewerLink, modelId: number) => ViewerPlayer;
  readConfiguration: () => ViewerConfiguration | undefined;
}

// The viewer a reading is shown on: read from the file at each reading, connected only while no connection is open,
// and nothing at all while no viewer is on file, so a machine without one never tries a socket
export const createViewerOpener = ({ connect, createPlayer, readConfiguration }: ViewerOpenerDependencies) => {
  let player: ViewerPlayer | undefined;
  return {
    dispose: () => {
      player?.dispose();
      player = undefined;
    },
    open: async (): Promise<ViewerPlayer | undefined> => {
      if (player?.isOpen()) return player;

      const configuration = readConfiguration();
      if (!configuration) return undefined;

      const link = await connect(configuration.address);
      if (!link) return undefined;

      player?.dispose();
      player = createPlayer(link, configuration.modelId);
      return player;
    },
  };
};
