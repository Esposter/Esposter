import type { ComponentPlaylist } from "#src/models/genshinAssets/shared/ComponentPlaylist";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { decodeGameSounds } from "#src/services/genshinAssets/music/decodeGameSounds";
import { readGameMixVolumes } from "#src/services/genshinAssets/music/readGameMixVolumes";
import { readGameMusicHierarchy } from "#src/services/genshinAssets/music/readGameMusicHierarchy";
import { resolveMusicPlaylistSegments } from "#src/services/genshinAssets/music/resolveMusicPlaylistSegments";
import { MUSIC_PACKAGE_PATTERN } from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// A component's music exported as its playlist plays it: the playlist its map names is read from the sound banks, one
// Pass of its tree resolved into its segments in order, each segment's clips gathered from its tracks with the volume
// The game's mix plays them at (`readGameMixVolumes`), and every source those clips play decoded as WAV by its id.
// Written beside the exports as `music/playlist.json`, which the fit reads with the sources. A segment whose tracks the
// Mix plays at different volumes has no one volume, and is refused
export const extractComponentPlaylist = async (component: DerivedAssetComponent): Promise<ComponentPlaylist> => {
  const { musicPlaylistId } = DerivedAssetComponentMap[component];
  if (musicPlaylistId === undefined) throw new InvalidOperationError(Operation.Read, component, "names no playlist");
  const { music } = getComponentDirectory(component);
  const hierarchy = await readGameMusicHierarchy();
  const playlist = hierarchy.playlists.get(musicPlaylistId);
  if (!playlist) throw new InvalidOperationError(Operation.Read, String(musicPlaylistId), "in no sound bank");
  const segmentIds = resolveMusicPlaylistSegments(playlist);
  const uniqueSegmentIds = [...new Set(segmentIds)];
  const hierarchySegments = uniqueSegmentIds.map((id) => {
    const segment = hierarchy.segments.get(id);
    if (!segment) throw new InvalidOperationError(Operation.Read, String(id), "in no sound bank");
    return segment;
  });
  const trackIds = new Set(hierarchySegments.flatMap(({ trackIds: segmentTrackIds }) => segmentTrackIds));
  const trackVolumeMap = new Map(
    (await readGameMixVolumes((id) => trackIds.has(id))).map(({ id, volume }) => [id, volume]),
  );
  const segments = hierarchySegments.map(({ duration, id, trackIds: segmentTrackIds }) => {
    const volumes = new Set(
      segmentTrackIds.map((trackId) => {
        const volume = trackVolumeMap.get(trackId);
        if (volume === undefined) throw new InvalidOperationError(Operation.Read, String(trackId), "has no volume");
        return volume;
      }),
    );
    if (volumes.size > 1)
      throw new InvalidOperationError(Operation.Read, String(id), "plays tracks at more than one volume");
    const [volume = 0] = volumes;
    return {
      clips: segmentTrackIds.flatMap((trackId) => hierarchy.tracks.get(trackId)?.clips ?? []),
      duration,
      id,
      volume,
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
  await Array.fromAsync(decodeGameSounds(MUSIC_PACKAGE_PATTERN, (id) => sourceIds.has(id), music));
  return componentPlaylist;
};
