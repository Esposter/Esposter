# Weather

The weathers, the blend between them, their particles and splashes, the lightning, the sandstorm's haze, the wetness, each area's weathers, the turn through them and the cities that hold clear are built: see [weather](../../specs/genshin/weather/design.md). What remains is what needs the game's data.

## Decisions

- **A weather's sky colours are the game's.** The game's environment scripts hold each weather's sky, cloud, light and fog colours by the hour beside the clear day's, so the inventory names those fields first, and each weather's colours are read from them rather than solved off recordings.
- **An area's weather turns on the game's own schedule.** Regular weather changes over time while special climates hold one weather. How long a weather lasts is in no table read so far, so the interval stays the provisional `AREA_WEATHER_CHANGE_SECONDS` until a recording measures it. The game's own weather data for an area holds which weathers it turns between and at what weights, and replaces the built stand-in, which drew each change from the standard chain for every area alike, its own chain read in the next step; each change blends as the built blend does.
- **The turn is the game's own chain of weathers.** `WeatherTemplateExcelConfigData` (AnimeGameData) gives each template a row per climate of weights for the next one, and `WeatherExcelConfigData` files the open world's weather areas under its templates. `Weather_Standard`, the regular areas', reads: from sunny, sunny 50, cloudy 25, rain 2, thunderstorm 1; from cloudy, sunny 40, cloudy 60, rain 4, thunderstorm 4; from rain, sunny 20, cloudy 20; from a thunderstorm, sunny 20, cloudy 30; and snow and mist name none, so they hold. The weights are normalised over the row, so rain always clears at its next turn. Sunny is the world's Clear, mist its Fog. An area turns only among its own catalogue weathers, a row's weights for any other dropped, and a row left empty holds. `Weather_City` sends every climate to sunny, which is the game's own reason cities never rain. Until the change interval is measured, the turn comes each `AREA_WEATHER_CHANGE_SECONDS`.
- **An area's template is the template of the weather area covering it, and no published table says which that is.** Each `WeatherExcelConfigData` row is a weather area: its template, its default climate, its environment profile, a priority for where two overlap and, for some, a height cap. No row has an outline or a world area. Its `areaID` is the weather area's own id, not `WorldAreaConfigData`'s `areaID1`, which only a handful of rows share by chance. A profile's name ("ESP_Md_General", "ESP_Ly_General") names a nation and never an area. So neither a join by id nor one by name holds. Nothing else in the dump links the two either. Its area, scene, map, tag and audio tables name no weather area. Its binary output's world areas ("Scene/WorldArea"), level areas ("Scene/LevelLayout"), level-design polygons and climates ("Climate/ConfigClimate") carry no weather. Which weather area covers a place is held only in the client's own scene, which waits on the user. Until it is read, every area turns by the standard chain over its catalogue weathers.

## Still to build

1. **Each area's template**, once the weather areas' outlines are read from the client's scene. `WeatherExcelConfigData` is added to `DUMP_TABLE_NAMES` (`scripts/src/services/genshinText/constants.ts`) and fetched with `pnpm -C scripts genshin:text fetch`. Each catalogue area takes the template of the weather area covering it, and an area whose template is not `Weather_Standard` gets its own rows. This waits on the user, since the outlines are in no published table.

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

## Reference

- `world-weather-turn.mkv` — the sky turning from clear to rain, or rain to clear, in one shot. On the wiki and YouTube, none found (searched 2026-10-11).
- `world-weather-schedule.mkv` — an open-world area with several weathers, its clock in view, held for ten minutes at 1080 high, so each change of its weather and how long each holds are read off it; the area's turn interval is settled by it ([weather](design.md)). On the wiki and YouTube, none found (searched 2026-10-11).
- `world-rain.mkv` — rain falling on the open world, the camera still, 20 seconds at most; the particles' and splashes' density, streak and ring looks are matched to it. On the wiki and YouTube, none found (searched 2026-10-11).
- `world-snow.mkv` — snow falling on Dragonspine or Snezhnaya, the camera still, 20 seconds at most; the flakes' density, drift and size are matched to it. Partly found 2026-10-11: the wiki's `File:Snezhnaya.png`; still sought: drift needs motion; a still gives the flakes' sparse density only, and the size is not legible at this scale.
