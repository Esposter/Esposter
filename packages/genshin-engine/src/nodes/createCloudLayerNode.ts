import type { CloudLayerUniforms } from "#src/models/atmosphere/CloudLayerUniforms";
import type { SkyUniforms } from "#src/models/atmosphere/SkyUniforms";
import type { Node } from "three/webgpu";

import {
  abs,
  acos,
  asin,
  atan,
  clamp,
  cos,
  cross,
  dot,
  float,
  Fn,
  max,
  min,
  mix,
  normalize,
  pow,
  saturate,
  sin,
  smoothstep,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

// The samples the dome's profile texture holds, evenly from the horizon to the zenith, which its node reads at their
// Centres (`createCloudLayerProfileTexture`)
const PROFILE_SAMPLE_COUNT = 64;
// The game's own constants in its cloud layer's programs: each density sample's scale and drift, the parallax's reach,
// The curl's drift, the wisps' and the coverage's curves and the edge's glow
const DENSITY_FIRST_SCALE = 1.2;
const DENSITY_SECOND_SCALE = 0.9;
const DENSITY_THIRD_SCALE = 0.7;
const ACOS_SCALE = 0.999899209;
const GLOW_STRENGTH = 50;
const LEAST_SHARE = 0.0001;
const smoothstepUnit = (value: Node<"float">): Node<"float"> => smoothstep(0, 1, value);
// A direction in three's axes in the game's, its z turned
const toGameAxes = (vector: Node<"vec3">): Node<"vec3"> => vec3(vector.x, vector.y, vector.z.negate());
// A sky's cloud layer as the game's own draws it (Login/Scene/Index.reference.ts, source `cloudLayerShader`), its
// Vertex and pixel programs read per pixel along the direction a ray looks, in the game's axes, which three's are with
// Z turned: the dome's projections blended by the layer's height and turned by its direction into the density's plane,
// Tiled and drifting at three scales and bent by its curl; the density cut at a threshold its coverage sets and
// Softened by its smoothness; its body shaded between the sky's dark and light cloud colours, each blended from away
// From the sun to toward it, by its normal map against the light; its edge lit by the sun's halo, its middle by the
// Sun's and moon's glow; and its wisps over it all. Handed back as a colour and its alpha, the wisps added under the
// Clouds' transparency, so the sky behind is drawn by one less the alpha and the colour added
export const createCloudLayerNode = (
  {
    center,
    curl,
    curlAmplitude,
    curlSpeed,
    curlTiling,
    density,
    direction: cloudDirection,
    elapsedTime,
    height: layerHeight,
    lightDirection,
    normal,
    normalYScale,
    opacity,
    profile,
    smoothness,
    sunBrightness,
    sunRimLightRadius,
    tiling,
    turn,
    weather,
    wisps,
    wispsCoverage,
    wispsElapsedTime,
    wispsOpacity,
    wispsTurn,
  }: CloudLayerUniforms,
  {
    cloudCoverage,
    cloudFrontBackBlend,
    cloudLitBackColor,
    cloudLitColor,
    cloudShadeBackColor,
    cloudShadeColor,
    cloudSunBrighten,
    moonDirection,
    moonGlowColor,
    sunDirection,
    sunHaloColor,
    sunHaloSize,
  }: SkyUniforms,
  direction: Node<"vec3">,
): Node<"vec4"> =>
  Fn(() => {
    const view = toGameAxes(direction);
    const [sun, moon, light] = [toGameAxes(sunDirection), toGameAxes(moonDirection), toGameAxes(lightDirection)];
    const up = view.y;
    const elevationShare = asin(clamp(up, -1, 1)).mul(2 / Math.PI);
    const dome = profile.sample(
      vec2(
        saturate(elevationShare)
          .mul((PROFILE_SAMPLE_COUNT - 1) / PROFILE_SAMPLE_COUNT)
          .add(0.5 / PROFILE_SAMPLE_COUNT),
        0.5,
      ),
    );
    const azimuth = atan(view.z, view.x);
    // The dome's plane, the projection its height reaches, about its middle, turned into the layer's direction
    const projected = azimuth.add(turn);
    const domeOffset = center.add(vec2(cos(projected), sin(projected)).mul(mix(dome.y, dome.z, layerHeight))).sub(0.5);
    const rotated = vec2(
      dot(vec2(cloudDirection.y, cloudDirection.x.negate()), domeOffset),
      dot(cloudDirection, domeOffset),
    ).add(0.5);
    const tiled = rotated.mul(tiling);
    const firstCoordinates = tiled.mul(DENSITY_FIRST_SCALE).add(vec2(elapsedTime.mul(0.6), 0));
    const secondCoordinates = tiled.mul(DENSITY_SECOND_SCALE).add(vec2(elapsedTime.mul(0.78), 0));
    const thirdCoordinates = tiled.mul(DENSITY_THIRD_SCALE).add(vec2(0.28, 0.0035).mul(elapsedTime));
    const curlCoordinates = rotated.mul(curlTiling).add(vec2(1.2, 0.8).mul(curlSpeed.mul(elapsedTime)));
    const wispsCoordinates = vec2(
      azimuth
        .add(wispsTurn)
        .div(2 * Math.PI)
        .add(wispsElapsedTime),
      dome.x,
    );
    // The dome's normal, inward and tilted from level by its ring's tilt, and its tangent round the axis
    const tilt = dome.w.mul(Math.PI / 2);
    const outward = vec3(cos(azimuth), 0, sin(azimuth));
    const domeNormal = vec3(outward.x.mul(cos(tilt)).negate(), sin(tilt), outward.z.mul(cos(tilt)).negate());
    const tangent = vec3(sin(azimuth).negate(), 0, cos(azimuth));
    const bitangent = cross(domeNormal, tangent);
    const tangentLight = normalize(vec3(dot(tangent, light), dot(bitangent, light), dot(domeNormal, light)));
    // The parallax's offset, the normal carried about the axis level across the view by the angle down from it
    const angle = acos(view.y.negate()).mul(ACOS_SCALE);
    const [angleSine, angleCosine] = [sin(angle), cos(angle)];
    const along = domeNormal.x.mul(view.z).sub(domeNormal.z.mul(view.x));
    const carriedX = domeNormal.z.add(along.mul(view.x));
    const carriedW = domeNormal.x.sub(along.mul(view.z));
    const parallax = vec2(domeNormal.x, domeNormal.z).add(
      vec2(view.z, view.x.negate())
        .mul(along)
        .add(
          vec2(carriedW, carriedX)
            .mul(angleCosine)
            .add(vec2(view.x, view.z).mul(domeNormal.y.mul(angleSine))),
        ),
    );
    // The cloud colours, toward the sun by how far toward it the ray looks, cubed
    const sunCosine = dot(view, sun);
    const sunSide = sunCosine.mul(0.5).add(0.5);
    const toward = pow(max(sunCosine.mul(cloudFrontBackBlend).add(float(1).sub(cloudFrontBackBlend)), 0), 3);
    const lit = mix(cloudLitBackColor, cloudLitColor, toward);
    const shade = mix(cloudShadeBackColor, cloudShadeColor, toward);
    const threshold = pow(float(1).sub(cloudCoverage.mul(0.7)), 3).sub(0.15);
    const clearing = smoothstepUnit(saturate(float(0.7).sub(cloudCoverage).mul(2.5)));
    const sunHalo = sunHaloColor.mul(saturate(pow(saturate(sunSide), sunHaloSize.mul(0.5).mul(abs(up))).mul(up)));
    const moonCosine = saturate(dot(moon, view));
    const moonHalo = moonGlowColor.mul(smoothstepUnit(max(pow(moonCosine, 5).sub(0.5).mul(2), 0)));
    const glowColor = sunHalo.add(moonHalo).mul(clearing);
    // The pixel program
    const horizonFade = min(smoothstepUnit(saturate(elevationShare.mul(10))), 1);
    const rim = sunBrightness.mul(
      smoothstepUnit(saturate(sunSide.sub(sunRimLightRadius).div(float(1).sub(sunRimLightRadius)))),
    );
    const curlShift = curl
      .sample(curlCoordinates)
      .xy.sub(0.5)
      .mul(weather.y.mul(curlAmplitude.mul(0.8)).add(curlAmplitude.mul(0.2)));
    const first = density.sample(firstCoordinates.add(curlShift));
    const second = density.sample(secondCoordinates.add(curlShift));
    const parallaxReach = float(0.03).sub(first.y.mul(0.01));
    const third = density.sample(thirdCoordinates.add(parallax.mul(parallaxReach)).add(curlShift.mul(0.5)));
    const sampledNormal = normal.sample(thirdCoordinates.add(curlShift)).xyz.mul(2).sub(1);
    const shadingNormal = normalize(vec3(sampledNormal.x, sampledNormal.y.mul(normalYScale), sampledNormal.z));
    const facing = float(1).sub(smoothstepUnit(saturate(dot(shadingNormal, tangentLight).mul(0.5).add(0.5))));
    const body = saturate(saturate(third.y.mul(third.z).mul(2)).add(third.x).sub(0.5));
    const cloudColor = mix(shade, lit, body.mul(body).mul(facing));
    const cloudDensity = float(1)
      .sub(horizonFade)
      .mul(0.2)
      .add(first.x.sub(0.5).mul(0.15).add(second.z.mul(first.z)).mul(weather.x));
    const edge = pow(saturate(second.x.mul(second.y).mul(2)), 2);
    const excess = cloudDensity.sub(threshold);
    const edgeGlow = max(
      float(0.5)
        .sub(saturate(excess.div(edge.mul(0.5).add(0.5))))
        .mul(2),
      LEAST_SHARE,
    );
    const glow = min(pow(edgeGlow, rim.mul(1.5)), 1).mul(pow(rim.mul(0.05), 2));
    const shaded = cloudColor
      .add(sunHaloColor.mul(glow).mul(edge).mul(clearing).mul(GLOW_STRENGTH))
      .add(lit.mul(edge.mul(0.5)).mul(cloudCoverage))
      .add(glowColor.mul(body));
    const cover = saturate(excess.div(edge.mul(mix(smoothness.x, smoothness.y, weather.z)).add(0.05))).mul(horizonFade);
    const overcast = smoothstepUnit(saturate(cloudCoverage.sub(0.5).mul(5)));
    const alpha = overcast.mul(float(1).sub(cover.mul(opacity))).add(cover.mul(opacity));
    const wispsShare = saturate(
      wisps.sample(wispsCoordinates).w.sub(float(1).sub(wispsCoverage)).div(max(wispsCoverage, LEAST_SHARE)),
    ).mul(wispsOpacity);
    const wispsColor = mix(lit, shade, wispsShare).mul(wispsShare);
    const color = shaded.sub(wispsColor).mul(alpha).add(wispsColor).mul(sunSide.mul(cloudSunBrighten).add(1));
    return vec4(color, alpha);
  })();
