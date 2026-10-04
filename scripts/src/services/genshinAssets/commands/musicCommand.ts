import type { SubCommandsDef } from "citty";

import { matchGameMusic } from "#src/services/genshinAssets/music/matchGameMusic";
import { readGameMusicHierarchy } from "#src/services/genshinAssets/music/readGameMusicHierarchy";
import { resolveMusicPlaylistSegments } from "#src/services/genshinAssets/music/resolveMusicPlaylistSegments";
import { getResult } from "@esposter/shared";
import { defineCommand } from "citty";

export const musicCommand: SubCommandsDef[string] = defineCommand({
  args: {
    recording: { description: "A recording of the game whose music to find", required: true, type: "positional" },
  },
  meta: {
    description:
      "Find which of the game's music sounds a recording plays, window by window, and the segments and playlists that play each",
    name: "music",
  },
  run: async ({ args }) => {
    const [windows, hierarchy] = await Promise.all([matchGameMusic(args.recording), readGameMusicHierarchy()]);
    for (const { matches, start } of windows)
      console.log(
        `${start.toFixed(0)}s: ${matches.map(({ id, score, start: soundStart }) => `${id} from ${soundStart.toFixed(1)}s ${score.toFixed(3)}`).join(", ")}`,
      );
    // Each sound that leads a window, up through the segments that play it to the playlists that order them, and each
    // Playlist's one pass in order, with its segments' lengths
    const playlistIds = new Set<number>();
    for (const id of new Set(windows.flatMap(({ matches: [best] }) => (best ? [best.id] : [])))) {
      const trackIds = new Set(
        [...hierarchy.tracks.values()]
          .filter(({ clips }) => clips.some(({ sourceId }) => sourceId === id))
          .map(({ id: trackId }) => trackId),
      );
      for (const segment of hierarchy.segments.values()) {
        if (!segment.trackIds.some((trackId) => trackIds.has(trackId))) continue;
        const segmentPlaylistIds = [...hierarchy.playlists.values()]
          .filter(({ segmentIds }) => segmentIds.includes(segment.id))
          .map(({ id: playlistId }) => playlistId);
        for (const playlistId of segmentPlaylistIds) playlistIds.add(playlistId);
        console.log(
          `sound ${id}: segment ${segment.id} (${(segment.duration / 1000).toFixed(3)}s) in playlist ${segmentPlaylistIds.join(", ") || "none"}`,
        );
      }
    }
    for (const playlistId of playlistIds) {
      const playlist = hierarchy.playlists.get(playlistId);
      if (!playlist) continue;
      getResult(() => resolveMusicPlaylistSegments(playlist)).match(
        (segmentIds) => {
          console.log(
            `playlist ${playlistId} plays ${segmentIds.map((segmentId) => `${segmentId} (${((hierarchy.segments.get(segmentId)?.duration ?? 0) / 1000).toFixed(3)}s)`).join(", ")}`,
          );
        },
        (error) => {
          console.log(`playlist ${playlistId}: ${error.message}`);
        },
      );
    }
  },
});
