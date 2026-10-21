# Wind

Read when anything moves in the wind, such as grass, crowns or clouds.

The one-line rule is in `SKILL.md`; this page is its reasoning.

- **There is one wind.** Anything that moves in the wind samples `createWindNode` over the world's `WindUniforms`, never a sway of its own, so a gust moves the grass, the crowns and the clouds together (`openspec/specs/genshin/vegetation/design.md`).
