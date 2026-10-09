// A machine that holds game data, reached over ssh on the local network; its identity file is the fleet's own key
export interface Peer {
  host: string;
  identityFile: string;
  parityDirectory: string;
  repository: string;
  user: string;
}
