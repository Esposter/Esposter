---
title: Weather
description: Proposal — Genshin's weather, still to come: each weather's sky colours read from the game's environment scripts, an area's weather turning on the game's own schedule rather than the built stand-in, the cities that never rain, and every provisional look fitted to recordings. The weather states, their blend, particles, splashes, lightning, sand haze, wetness, each area's weathers in the catalogue and the turn through them are built, as the weather page describes.
model: claude-opus-5-5
needs: [game-exports]
---

# Weather

The weathers, the blend between them, their particles and splashes, the lightning, the sandstorm's haze, the wetness, each area's weathers and the turn through them are built: see [weather](/docs/genshin/weather). What remains is what needs the game's data.

## Decisions

- **A weather's sky colours are the game's.** The game's environment scripts hold each weather's sky, cloud, light and fog colours by the hour beside the clear day's, so the inventory names those fields first, and each weather's colours are read from them rather than solved off recordings.
- **An area's weather turns on the game's own schedule.** Regular weather changes over time while special climates hold one weather. The game's own weather data for an area holds which weathers it turns between and how long each lasts, and replaces the built stand-in: until it is read, an area with several weathers turns through them in list order each provisional interval, each change blending as the built blend does.
- **Cities never rain.** The wiki has rain stop at a city's edge even while the area round it rains, so a city subarea's outline, once the catalogue draws subareas', holds its weather clear inside the area's. The catalogue's subareas carry names but no outlines yet, so this waits on them.

## Deferred compute

- **Each weather's colours.** From the environment scripts' fields once the inventory names them, each weather's colours by the hour, fitted into `WEATHER_SETTINGS_MAP`.
- **The particles' and splashes' look.** Density, streak length and speed, colour, and the splashes' size, life and count, matched to a recording of each weather by their statistics and never pixel for pixel.
- **The blend and the lightning.** How long a change takes, read off a recording of the weather turning; how often a thunderstorm strikes, its flash's pulses and colour, and its bolt's shape and distance, read off a recording of one; and the sandstorm's haze colour, off a recording of the Desert of Hadramaveth's storm.
- **The areas' weather.** The catalogue's weathers per area are the wiki's; the game's own area and weather data replace them where the inventory finds it, Snezhnaya's first, which the wiki does not give. The turn's change interval and its order are the stand-ins until that data and a recording of an area's weather changing over minutes settle them.

## Key files

| File                                                       | Role                                                                                        |
| :--------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `packages/genshin-engine/src/atmosphere/constants.ts`      | The weather settings and looks still to be fitted                                           |
| `packages/genshin-world/src/data/catalogue.json`           | Each area's weathers, the wiki's until the game's are read                                  |
| `packages/genshin-world/src/composables/useAreaWeather.ts` | The turn through an area's weathers, on the provisional interval until the schedule is read |
| `packages/genshin-world/src/services/constants.ts`         | The provisional change interval                                                             |

## Sources

- [Weather](https://genshin-impact.fandom.com/wiki/Weather), Genshin Impact Wiki: regular weather changing over time, special climates holding one weather, and no rain in cities.
