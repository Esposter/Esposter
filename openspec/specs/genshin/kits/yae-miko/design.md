# Yae Miko

Yae Miko's kit is its record and one behaviour module, `createYaeMikoKitBehaviour`, on avatar 10000058: three strikes, a charged attack, a collision and two plunges, Sesshou Sakura's totems and Great Secret Art: Tenko Kenshin. Her multipliers are read from proud skill groups 5831, 5832 and 5839; the charged attack's stamina, and the skill's and burst's cooldowns with the burst's energy cost, come from the same groups. A totem stands for 900 frames and strikes a circle of radius 0.5 round itself at 120 frames and then every 176, at the multiplier of the level its cast gives, one to three by the totems standing then, and a fourth totem pops the oldest. Great Secret Art: Tenko Kenshin hits a circle of radius 7 at 100 frames, and destroys every standing totem for a Tenko Thunderbolt each, at 154 frames and then every 24. The charged attack strikes once. Her passives and constellations are not built.

## Decisions

- **A totem's strikes are fixed as it is cast.** gcsim reads the totems standing at each strike, but a kit's hits are fixed when their action starts, so a totem's strikes take the level its cast gives, and a later cast does not raise them. Each strike lands on the enemies within its circle round the totem; gcsim picks one enemy within a detection radius that its file leaves to a constant not given, so that radius is not built.
- **A totem lasts gcsim's 900 frames, not the table's 14 at index 4.** The two differ, and the table's value is not read until one is checked.
