// The weather an area can have, as the game names them: the clear and cloudy skies most areas have, the rain and its
// Thunderstorm, the snow of the north and its Snowstorm, the fog of the islands and the sandstorms of the desert. The
// Snowstorm is the wiki's Subzero Climate weather, which only Dragonspine has (Weather, Snowstorm section); the Sheer
// Cold page's modifier table gives it +200% accumulation under Colder environments, and the Weather page a base rate
// 2.5 times the snow's, which the two wiki figures disagree on, so its rate is left to the Sheer Cold change
export enum WeatherKind {
  Clear = "Clear",
  Cloudy = "Cloudy",
  Fog = "Fog",
  Rain = "Rain",
  Sandstorm = "Sandstorm",
  Snow = "Snow",
  Snowstorm = "Snowstorm",
  Thunderstorm = "Thunderstorm",
}
