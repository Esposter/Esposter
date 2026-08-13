import { dayjs } from "#shared/services/dayjs";

export const GlobeConfiguration = {
  arcLength: 0.9,
  arcTime: dayjs.duration(2, "second").asMilliseconds(),
  atmosphereAltitude: 0.25,
  atmosphereColor: "#3a228a",
  color: "#3a228a",
  emissive: "#220038",
  emissiveIntensity: 0.1,
  hexPolygonColor: "rgba(255,255,255,0.7)",
  isAtmosphereVisible: true,
  ringMaxRadius: 3,
  rings: 3,
  shininess: 0.7,
};
