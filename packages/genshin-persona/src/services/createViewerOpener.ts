import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";
import type { ViewerLink } from "#src/models/ViewerLink";
import type { ViewerPlayer } from "#src/services/createViewerPlayer";

export interface ViewerOpenerDependencies {
  connect: (address: string) => Promise<undefined | ViewerLink>;
  createPlayer: (link: ViewerLink, modelId: number) => ViewerPlayer;
  readConfiguration: () => undefined | ViewerConfiguration;
}

// The viewer a reading is shown on: read from the file at each reading, connected only while no connection is open,
// And nothing at all while no viewer is on file, so a machine without one never tries a socket
export const createViewerOpener = ({ connect, createPlayer, readConfiguration }: ViewerOpenerDependencies) => {
  let player: undefined | ViewerPlayer;
  let connected: Pick<ViewerConfiguration, "address" | "modelId"> | undefined;
  return {
    dispose: (): void => {
      player?.dispose();
      player = undefined;
    },
    open: async (): Promise<undefined | ViewerPlayer> => {
      const configuration = readConfiguration();
      if (!configuration) return undefined;

      const isConnectedToConfiguration =
        connected?.address === configuration.address && connected.modelId === configuration.modelId;
      if (player?.isOpen() && isConnectedToConfiguration) return player;

      player?.dispose();
      player = undefined;
      const link = await connect(configuration.address);
      if (!link) return undefined;

      player = createPlayer(link, configuration.modelId);
      connected = { address: configuration.address, modelId: configuration.modelId };
      return player;
    },
  };
};
