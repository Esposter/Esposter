---
title: Weather
description: Proposal — Genshin's weather, still to come: each weather's sky colours read from the game's environment scripts, an area's weather turning over time on the game's own schedule, the cities that never rain, and every provisional look fitted to recordings. The weather states, their blend, particles, splashes, lightning, sand haze and wetness, and each area's weathers in the catalogue are built, as the weather page describes.
model: claude-opus-5-5
---

# Weather

The weathers, the blend between them, their particles and splashes, the lightning, the sandstorm's haze, the wetness and each area's weathers are built: see [weather](/docs/genshin/weather). What remains is what needs the game's data.

## Decisions

- **A weather's sky colours are the game's.** The game's environment scripts hold each weather's sky, cloud, light and fog colours by the hour beside the clear day's, so the inventory names those fields first, and each weather's colours are read from them rather than solved off recordings.
- **An area's weather turns on the game's own schedule.** Regular weather changes over time while special climates hold one weather; the game's own weather data for an area holds which weathers it turns between and how long each lasts, so the world turns an area's weather by it, each change blending as the built blend does.
- **Cities never rain.** The wiki has rain stop at a city's edge even while the area round it rains, so a city subarea's outline, once the catalogue draws subareas', holds its weather clear inside the area's.

## Deferred compute

- **Each weather's colours.** From the environment scripts' fields once the inventory names them, each weather's colours by the hour, fitted into `WEATHER_SETTINGS_MAP`.
- **The particles' and splashes' look.** Density, streak length and speed, colour, and the splashes' size, life and count, matched to a recording of each weather by their statistics and never pixel for pixel.
- **The blend and the lightning.** How long a change takes, read off a recording of the weather turning; how often a thunderstorm strikes, its flash's pulses and colour, and its bolt's shape and distance, read off a recording of one; and the sandstorm's haze colour, off a recording of the Desert of Hadramaveth's storm.
- **The areas' weather.** The catalogue's weathers per area are the wiki's; the game's own area and weather data replace them where the inventory finds it, Snezhnaya's first, which the wiki does not give.

## Key files

| File                                                       | Role                                                       |
| :--------------------------------------------------------- | :--------------------------------------------------------- |
| `packages/genshin-engine/src/atmosphere/constants.ts`      | The weather settings and looks still to be fitted          |
| `packages/genshin-world/src/data/catalogue.json`           | Each area's weathers, the wiki's until the game's are read |
| `packages/genshin-world/src/composables/useAreaWeather.ts` | Where an area's weather will turn on the game's schedule   |

## Sources

- [Weather](https://genshin-impact.fandom.com/wiki/Weather), Genshin Impact Wiki: regular weather changing over time, special climates holding one weather, and no rain in cities.
