# Weather

Weather moves the same sky, haze and ground that the [sky and time](../sky-and-time/design.md) page lights, rather than a second set of them. A weather is a small table of settings, and the world blends from where the weather stands toward the active one's over the region's own clear sky. Its particles and splashes are one instanced draw each, placed in the vertex stage, so their cost is the same whichever weather is on.

## How it works

```mermaid
flowchart TD
  CAM[The camera's place] --> AREA{The catalogue area whose outline holds it}
  AREA -->|its first weather| AW[The area's weather]
  AREA -->|several, each change interval| TURN["Its next weather, drawn by the game's chain"]
  TURN --> AW
  AW --> CITY{"Inside one of the area's cities?"}
  CITY -->|no| W[The weather]
  CITY -->|yes| CLEAR[Clear]
  AREA -->|none| CLEAR
  CLEAR --> W
  W -->|changed| BLEND["Blend from where it stood, nine seconds, eased in and out"]
  BLEND --> STATE[The weather as it stands]
  STATE -->|max over the region's clear values| SKY[Cloud coverage and fog density]
  STATE --> WET[Wetness: the toon surfaces, the ground and the grass darken and glint]
  STATE --> PU["Particles of one kind at their share, rain's splashes with them"]
  STATE --> TINT["Sand's haze laid over the sky's fog colour each frame"]
  STATE --> RATE{A strike this frame, at the weather's rate?}
  RATE -->|yes| BOLT[A bolt on the ground somewhere round the eye]
  BOLT --> FLASH["Two pulses of flash over the sky's colours and the ambient light"]
```

- **The area names the weather.** Each catalogue area lists the weathers it can have, the first its own, the weather a visit finds it in ([world map](../world-map/design.md)): most areas clear, cloudy, rain and thunderstorm, deserts clear and cloudy, the Desert of Hadramaveth clear and sandstorms, Dragonspine snow, Tsurumi Island fog and Yashiori Island its thunderstorm, as the wiki gives them. The world draws the weather of the area its camera stands in, checked each time the camera has moved a stretch (`useAreaWeather`), and clear where no drawn outline holds it. An area with several weathers turns each `AREA_WEATHER_CHANGE_SECONDS` to the next the game's standard chain draws among them (`getNextAreaWeather`, its weights in `WeatherKindTransitionWeightsMap`), the change blending as below; a special climate with one weather holds it. The Desert of Hadramaveth stays clear: the standard chain gives clear no turn to a sandstorm, so its sandstorm waits on its own chain being read. Entering an area starts its first weather again.
- **A city holds clear.** A subarea the game files as a city (`AreaTerrainType.City`, [world map](../world-map/design.md)) holds the weather clear inside its outlines while its area's turn goes on outside (`checkIsInCity`), as the wiki has rain stop at a city's edge, so leaving the city finds the area's weather as it has turned meanwhile. The edge is found as the area is, each time the camera has moved a stretch, and crossing it blends like any change. Only a city the game's polygons outline clears: the cities the game marks that have no outline yet are Dornman Port, the Collective of Plenty, the Clink-Clank Krumkake Craftshop, Nasha Town, Final Night Cemetery and the Kuuvahki Experimental Design Bureau.
- **A change blends.** When the weather changes, every field moves from where it stood toward the new weather's settings over `WEATHER_TRANSITION_SECONDS`, eased in and out by a smoothstep, so the sky darkens and the rain thickens together (`blendWeatherState`). A change begun part way through another starts from where the first had reached. One kind of particle falls at a time: where the kind changes, rain into snow say, the old fades out over the first half and the new fades in over the second. The weather the world loads with is set at once.
- **A weather raises the region's clear values; it never lowers them.** Cloud coverage and fog density take the larger of the region's own and the weather's, so a clear weather leaves the region's sky as it was (`applyWeatherState`). These are written only while a change runs, so the tuning panel's cloud and fog sliders hold otherwise.
- **A sandstorm's haze takes the sand's colour.** A weather may tint the haze (`fogColor`). The sky writes the fog's colour every frame, so the weather lays its tint over it every frame it holds one, by its share, as a scene colour through the tone curve's inverse, as the sky's own colours are.
- **Particles fall in a box round the eye.** A particle's base is a hash of its instance's index. It falls on the wind's drift over its fall speed, and is wrapped inside a box of sixty metres across and thirty up, so the particles stay put in the world and the box never empties. Each streak is a quad stretched along its velocity, turned to face the camera, and lit by the light's colour, so it dims at night with the sky.
- **Rain splashes where it meets the ground.** A second draw of small rings lies flat round the eye, each widening and fading over a third of a second and then landing somewhere new, its place a hash of its instance and its life's count (`createSplashMaterial`). It stands on the ground capture's height, the one the grass grows on, or on the water where the ground lies under it, so rain rings the lake too. Its share is the rain's, so snow and sand splash nothing.
- **Lightning flashes and strikes.** A thunderstorm strikes 27.6 times a minute, the flashes counted off Yashiori Island's perpetual storm, at random at its rate, one strike at a time. A strike's flash is two pulses, the second dimmer, each dying away within a tenth of a second or so (`computeLightningFlash`), laid over the sky the clock has just written: the sky's and the clouds' colours turned toward the flash's and the ambient light raised (`applyLightningFlash`). Its bolt stands on the ground between one and six hundred metres from the eye, turned at random: a seeded channel climbing to the cloud base in jagged segments with a few branches falling away from it (`computeLightningBolt`), each segment a ribbon turned to face the eye, adding light, writing no depth and glowing as bright as the flash.
- **Wet ground darkens and takes a glint.** Every toon material, the ground's and the grass's read the one wetness uniform: its colour darkens by up to a third (`createWetDarkeningNode`), and the sun's half-way highlight adds a glint in proportion. The grass glints off the ground's upward normal it shades by, so a wet meadow shines as one surface.
- **Under the water the water's haze wins.** The weather runs ahead of the water each frame, so the water's haze replaces the weather's colour under its surface, and a density the weather writes while the eye is under water is kept for surfacing rather than drawn (`updateUnderwaterFog`).

## What each weather sets

| Weather      | Cloud cover  | Fog density  | Haze tint | Wetness | Particles                         | Lightning     |
| :----------- | :----------- | :----------- | :-------- | :------ | :-------------------------------- | :------------ |
| Clear        | the region's | the region's | none      | none    | none                              | none          |
| Cloudy       | raised       | the region's | none      | none    | none                              | none          |
| Fog          | raised       | raised       | none      | none    | none                              | none          |
| Rain         | raised       | raised       | none      | full    | rain streaks and splashes         | none          |
| Thunderstorm | full         | raised       | none      | full    | rain streaks and splashes, denser | 27.6 a minute |
| Snow         | raised       | raised       | none      | none    | snowflakes, drifting and swaying  | none          |
| Sandstorm    | raised       | raised       | sand      | none    | sand streaks along the wind       | none          |

The values are starting points, not the game's: each is marked provisional where it stands, and fitted as the [weather](../../../changes/genshin-weather/design.md) proposal lists.

## Cost

- **One instanced draw for the particles and one for the splashes.** Both are instanced geometries placed in the vertex stage, so no particle is stored and no frame writes per particle.
- **A frame writes the eye, and the blend while a change runs.** The flash writes a handful of colours while it lasts, and the bolt is one small mesh shown for under a second.
- **A dry world costs nothing extra.** The wetness darkening and glint multiply by zero and add nothing, and a weather that tints no haze writes no colour.
- **The desert clip is taken as a sandstorm.** `captures/yt-k_FKK0qcYHw-0-40.mp4` (0 to 40 seconds) and the wiki's `File:Desert of Hadramaveth.png` are the sandstorm the haze and streaks are matched to; a clip showing only a dust column would change the match.

## Key files

| File                                                                           | Role                                                                       |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| `packages/genshin-engine/src/atmosphere/constants.ts`                          | Each weather's settings, the transition, the lightning and splashes' looks |
| `packages/genshin-engine/src/atmosphere/blendWeatherState.ts`                  | The weather part way from where it stood to the next one's settings        |
| `packages/genshin-engine/src/atmosphere/applyWeatherState.ts`                  | The weather as it stands written into the sky, fog, wetness and particles  |
| `packages/genshin-engine/src/atmosphere/computeLightningFlash.ts`              | A strike's two pulses of flash                                             |
| `packages/genshin-engine/src/atmosphere/applyLightningFlash.ts`                | The flash laid over the sky's colours and the ambient light                |
| `packages/genshin-engine/src/atmosphere/computeLightningBolt.ts`               | A bolt's seeded channel and branches                                       |
| `packages/genshin-engine/src/nodes/createLightningBoltMaterial.ts`             | The bolt's segments facing the eye and glowing with the flash              |
| `packages/genshin-engine/src/nodes/createPrecipitationMaterial.ts`             | The particles: the wrapped box, the sway, the streaks facing the eye       |
| `packages/genshin-engine/src/nodes/createSplashMaterial.ts`                    | The rain's splashes on the ground capture or the water                     |
| `packages/genshin-engine/src/nodes/createWetDarkeningNode.ts`                  | How far a wet surface darkens                                              |
| `packages/genshin-engine/src/water/updateUnderwaterFog.ts`                     | The water's haze under its surface, keeping what the weather writes above  |
| `packages/genshin-world/src/composables/useAreaWeather.ts`                     | The weather of the area the camera stands in, turning through its weathers |
| `packages/genshin-world/src/services/world/getNextAreaWeather.ts`              | The next weather an area turns to, drawn by the standard chain             |
| `packages/genshin-world/src/services/world/checkIsInCity.ts`                   | Whether the camera stands inside one of its area's cities                  |
| `packages/genshin-world/src/services/world/WeatherKindTransitionWeightsMap.ts` | The standard chain's weights, each weather's row for the next              |
| `packages/genshin-world/src/services/constants.ts`                             | The area weather's change interval, provisional                            |
| `packages/genshin-world/src/components/World/Weather/Index.vue`                | The blend, the particles, the splashes, the haze's tint and the lightning  |

## Notes

- **Windrise stays clear.** Galesong Hill's own weather is clear, as its reference screenshots are. Moving its area's list to start at rain shows the rain over the valley, which the parity pages do not measure.
- **An area's weather turns on a provisional schedule.** The standard chain is the game's, but the change interval is a built stand-in, and the special climates' own chains are not yet read, while a city holds clear by its outline rather than by its own chain, which sends every weather to clear; the game's own weather data, which weathers an area turns between and at what weights, replaces each area's chain when it is read, and a recording of an area's weather changing replaces the interval ([weather](../../../changes/genshin-weather/design.md)).
- **The bolt shines through the haze.** It writes no depth, so the height fog, a post pass over the depth, does not reach it, as a strike reads through the game's rain.
- **The first recordings of a turning sky and of a thunderstorm were a dusk.** Each first minute (`world-weather-turn.dusk.mkv` and `world-thunderstorm.dusk.mkv`, both 1280 by 592) is a clear dusk settling into night, with a moon up by about twenty seconds, no rain at any still and no flash in the thunderstorm's. Its sky darkens from the first still and its mean luma stops falling near forty seconds, a time-of-day change rather than a weather change, so it neither confirms nor moves `WEATHER_TRANSITION_SECONDS` and gives no strike to count. Both are kept under the `.dusk` name and replaced. The turn is a thunderstorm clearing to sun, rain to clear rather than clear to rain, and `WEATHER_TRANSITION_SECONDS` is nine seconds, read off that clip: its top-left sky's frame-to-frame change spikes once, from about 8 s to 16.6 s, and settles by 18.7 s. The thunderstorm is Yashiori Island's perpetual storm, whose flashes come every two or three seconds, so the rate read off it is that storm's and may run above an ordinary thunderstorm's few strikes a minute. Its sky inside the pillarbox, read over 3000 stills at 60 a second, falls 40 or more under its median darkness in 23 runs, 27.6 a minute, the `lightningRate` the thunderstorm takes. Several of those runs come in twos and threes under four tenths of a second apart, the flicker of one strike, so taken as strikes the clip holds 15, 18 a minute.

## Sources

- [Weather](https://genshin-impact.fandom.com/wiki/Weather), Genshin Impact Wiki: weather tied to areas with only the current location's drawn, regular weather changing over time, no rain in cities or deserts, snow on Dragonspine, fog on Tsurumi Island, the perpetual thunderstorm of Yashiori Island, and sandstorms in the Desert of Hadramaveth.
- [Lightning](https://genshin-impact.fandom.com/wiki/Lightning), Genshin Impact Wiki: lightning striking the land during thunderstorms.
- `world-sandstorm.mkv` — a sandstorm in the Desert of Hadramaveth, the camera still, 20 seconds at most; the haze's colour and the sand's streaks are matched to it. Found 2026-10-11: the wiki's `File:Desert of Hadramaveth.png` and https://www.youtube.com/watch?v=k_FKK0qcYHw at 0–40 s (`captures/yt-k_FKK0qcYHw-0-40.mp4`).
