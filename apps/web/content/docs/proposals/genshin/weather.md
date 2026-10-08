---
title: Weather
description: Proposal — Genshin's weather, still to come: each area naming its weather from the game's own data, each weather's sky colours read from the game's environment scripts, the lightning flash and bolt, the splashes where rain meets the ground, and the sandstorm's fog colour. The weather states, their particles and the wetness are built, as the weather page describes.
model: claude-opus-5-5
---

# Weather

The rain, snow, fog and sandstorm states, their particles and the one wetness uniform are built: see [weather](/docs/genshin/weather). What remains is what needs the game's data or a decision that is not yet made.

## Decisions

- **Weather belongs to an area, as in the game.** Each area in the catalogue names the weather it can have, read from the game's own area and weather data where the inventory finds it and from the wiki where it does not. Only the weather where the camera stands is drawn.
- **A weather's sky colours are the game's.** The game's environment scripts hold each weather's sky, cloud, light and fog colours by the hour beside the clear day's, so the inventory names those fields first, and each weather's colours are read from them rather than solved off recordings.
- **Lightning is a brief flash through the sky and the light, followed by a bolt drawn as a mesh.**
- **Rain splashes where the drops meet the ground.**
- **A sandstorm's fog takes the sand's colour** and no longer the clear haze's.

## Still to decide

- **How weather changes.** Whether a change blends over a duration or cuts, and how long a blend runs. The weather page sets a weather at once.
- **When lightning strikes.** How often, how long the flash lasts, and where the bolt falls.
- **Wet specular on grass.** The grass material sets its own colour, so wet grass takes neither the darkening nor the glint.

## Deferred compute

- **Each weather's colours.** From the environment scripts' fields once the inventory names them, each weather's colours by the hour, fitted into `WEATHER_SETTINGS_MAP`.
- **The particles' look.** Density, streak length and speed, and colour, matched to a recording of each weather by its statistics and never pixel for pixel.
- **The areas' weather.** The catalogue's weather per area, from the game's data and the wiki.

## Key files

| File                                                            | Role                                                       |
| :-------------------------------------------------------------- | :--------------------------------------------------------- |
| `packages/genshin-engine/src/atmosphere/constants.ts`           | The weather settings and particle looks still to be fitted |
| `packages/genshin-world/src/services/world/catalogue.ts`        | Where each area's weather will be read from                |
| `packages/genshin-world/src/components/World/Weather/Index.vue` | Where the lightning and splashes will be drawn             |

## Sources

- [Weather](https://genshin-impact.fandom.com/wiki/Weather), Genshin Impact Wiki: weather tied to areas with only the current location's drawn, rain and thunderstorms, no rain in cities or deserts, snow on Dragonspine, fog on Tsurumi Island, and sandstorms in the Desert of Hadramaveth.
