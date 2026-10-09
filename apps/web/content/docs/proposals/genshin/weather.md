---
title: Weather
description: Proposal — Genshin's weather, still to come: each weather's sky colours read from the game's environment scripts, an area's weather turning on the game's own schedule rather than the built stand-in, the cities that never rain, and every provisional look fitted to recordings. The weather states, their blend, particles, splashes, lightning, sand haze, wetness, each area's weathers in the catalogue and the turn through them are built, as the weather page describes.
model: claude-opus-5-5
touches:
  [
    "packages/genshin-world/src/services/world/WeatherKindTransitionWeightsMap.ts",
    "packages/genshin-world/src/services/world/getNextAreaWeather.ts",
    "packages/genshin-world/src/services/world/getNextAreaWeather.test.ts",
  ]
---

# Weather

The weathers, the blend between them, their particles and splashes, the lightning, the sandstorm's haze, the wetness, each area's weathers and the turn through them are built: see [weather](/docs/genshin/weather). What remains is what needs the game's data.

## Decisions

- **A weather's sky colours are the game's.** The game's environment scripts hold each weather's sky, cloud, light and fog colours by the hour beside the clear day's, so the inventory names those fields first, and each weather's colours are read from them rather than solved off recordings.
- **An area's weather turns on the game's own schedule.** Regular weather changes over time while special climates hold one weather. The game's own weather data for an area holds which weathers it turns between and how long each lasts, and replaces the built stand-in, which turns through an area's weathers in list order: its chain is read in the next decision, and each change blends as the built blend does.
- **The turn is the game's own chain of weathers.** `WeatherTemplateExcelConfigData` (AnimeGameData) gives each template a row per climate of weights for the next one, and `WeatherExcelConfigData` files the open world's areas under its templates. `Weather_Standard`, the regular areas', reads: from sunny, sunny 50, cloudy 25, rain 2, thunderstorm 1; from cloudy, sunny 40, cloudy 60, rain 4, thunderstorm 4; from rain, sunny 20, cloudy 20; from a thunderstorm, sunny 20, cloudy 30; and snow and mist name none, so they hold. The weights are normalised over the row, so rain always clears at its next turn. Sunny is the world's Clear, mist its Fog. An area turns only among its own catalogue weathers, a row's weights for any other dropped, and a row left empty holds. `Weather_City` sends every climate to sunny, which is the game's own reason cities never rain. Until the change interval is measured, the turn comes each `AREA_WEATHER_CHANGE_SECONDS`.
- **Cities never rain.** The wiki has rain stop at a city's edge even while the area round it rains, so a city subarea's outline, once the catalogue draws subareas', holds its weather clear inside the area's. The catalogue's subareas carry names but no outlines yet, so this waits on them.

## Still to build

```text
packages/genshin-world/src/services/world/WeatherKindTransitionWeightsMap.ts
```

1. **The turn as the game's chain, next.** A new `WeatherKindTransitionWeightsMap.ts` holds `Weather_Standard`'s rows as the Decisions read them, keyed by `WeatherKind`, a public fact of the game's table rather than data generated from it. A new `getNextAreaWeather.ts` beside it takes the current weather, the area's weathers and a draw from the world's seeded random source (`createSeededRandom`), and returns the next by the row's weights over the area's own weathers, or the current one where none is left. `useAreaWeather` calls it in place of turning to the next in list order. Its test, `getNextAreaWeather.test.ts`, reads Clear after Clear at a draw of 0 and Thunderstorm at 0.99, never Rain after Rain, Snow held, and an area whose list lacks Thunderstorm never turning to it.
2. **Each area's template**, from `WeatherExcelConfigData`, added to `DUMP_TABLE_NAMES` (`scripts/src/services/genshinText/constants.ts`) and fetched with `pnpm -C scripts genshin:text fetch`: each catalogue area joined to its game area by the English name of `WorldAreaConfigData`'s entry, and an area whose template is not `Weather_Standard` given its own rows.
3. **Cities clear inside their outlines**, once the catalogue draws subareas' outlines.

## Deferred compute

- **Each weather's colours.** From the environment scripts' fields once the inventory names them, each weather's colours by the hour, fitted into `WEATHER_SETTINGS_MAP`.
- **The particles' and splashes' look.** Density, streak length and speed, colour, and the splashes' size, life and count, matched to a recording of each weather by their statistics and never pixel for pixel.
- **The blend and the lightning.** How long a change takes, read off a recording of the weather turning; how often a thunderstorm strikes, its flash's pulses and colour, and its bolt's shape and distance, read off a recording of one; and the sandstorm's haze colour, off a recording of the Desert of Hadramaveth's storm.
- **The areas' weather.** The catalogue's weathers per area are the wiki's; the game's own area and weather data replace them where the inventory finds it, Snezhnaya's first, which the wiki does not give. The turn's change interval is the stand-in until a recording of an area's weather changing over minutes settles it, and the order of an area whose template is not `Weather_Standard` or `Weather_City` until its own rows are read; the standard and city chains are the game's, as the Decisions read them.

## Key files

| File                                                       | Role                                                                                        |
| :--------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `packages/genshin-engine/src/atmosphere/constants.ts`      | The weather settings and looks still to be fitted                                           |
| `packages/genshin-world/src/data/catalogue.json`           | Each area's weathers, the wiki's until the game's are read                                  |
| `packages/genshin-world/src/composables/useAreaWeather.ts` | The turn through an area's weathers, on the provisional interval until the schedule is read |
| `packages/genshin-world/src/services/constants.ts`         | The provisional change interval                                                             |

## Sources

- [Weather](https://genshin-impact.fandom.com/wiki/Weather), Genshin Impact Wiki: regular weather changing over time, special climates holding one weather, and no rain in cities.
