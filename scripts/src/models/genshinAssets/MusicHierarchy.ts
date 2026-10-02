import type { MusicPlaylist } from "#src/models/genshinAssets/MusicPlaylist";
import type { MusicSegment } from "#src/models/genshinAssets/MusicSegment";
import type { MusicTrack } from "#src/models/genshinAssets/MusicTrack";

// The game's interactive music as its sound banks hold it, each object by its id
export interface MusicHierarchy {
  playlists: Map<number, MusicPlaylist>;
  segments: Map<number, MusicSegment>;
  tracks: Map<number, MusicTrack>;
}
