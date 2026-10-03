import type { ComponentPlaylist } from "#src/models/genshinAssets/ComponentPlaylist";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { decodeGameSounds } from "#src/services/genshinAssets/decodeGameSounds";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readGameMusicHierarchy } from "#src/services/genshinAssets/readGameMusicHierarchy";
import { resolveMusicPlaylistSegments } from "#src/services/genshinAssets/resolveMusicPlaylistSegments";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// A component's music exported as its playlist plays it: the playlist its map names is read from the sound banks, one
// Pass of its tree resolved into its segments in order, each segment's clips gathered from its tracks, and every source
// Those clips play decoded as WAV by its id. Written beside the exports as `music/playlist.json`, which the fit reads
// With the sources
export const extractComponentPlaylist = async (component: DerivedAssetComponent): Promise<ComponentPlaylist> => {
  const { musicPlaylistId } = DerivedAssetComponentMap[component];
  if (musicPlaylistId === undefined) throw new InvalidOperationError(Operation.Read, component, "names no playlist");
  const { music } = getComponentDirectory(component);
  const hierarchy = await readGameMusicHierarchy();
  const playlist = hierarchy.playlists.get(musicPlaylistId);
  if (!playlist) throw new InvalidOperationError(Operation.Read, String(musicPlaylistId), "in no sound bank");
  const segmentIds = resolveMusicPlaylistSegments(playlist);
  const uniqueSegmentIds = [...new Set(segmentIds)];
  const segments = uniqueSegmentIds.map((id) => {
    const segment = hierarchy.segments.get(id);
    if (!segment) throw new InvalidOperationError(Operation.Read, String(id), "in no sound bank");
    return {
      clips: segment.trackIds.flatMap((trackId) => hierarchy.tracks.get(trackId)?.clips ?? []),
      duration: segment.duration,
      id,
    };
  });
  // The root's loop count is how many passes the playlist plays, none meaning forever
  const componentPlaylist: ComponentPlaylist = {
    isLooping: takeOne(playlist.items, 0).loopCount === 0,
    order: segmentIds.map((id) => uniqueSegmentIds.indexOf(id)),
    segments,
  };
  await mkdir(music, { recursive: true });
  await writeFile(join(music, "playlist.json"), `${JSON.stringify(componentPlaylist, null, 2)}\n`);
  const sourceIds = new Set(segments.flatMap(({ clips }) => clips.map(({ sourceId }) => sourceId)));
  await Array.fromAsync(decodeGameSounds((id) => sourceIds.has(id), music));
  return componentPlaylist;
};
