## 1. Area templates

- [ ] 1.1 Add the weather templates table to the game text dump's fetched tables and fetch it. Verify: `pnpm -C scripts genshin:text fetch` completes with WeatherExcelConfigData among the tables it writes. Blocked until the weather areas' outlines are read from the client's scene.
- [ ] 1.2 Give each catalogue area the template of the weather area covering it, with an area whose template is not the standard one turning by its own rows. Verify: a test named after the scenario 'An area with its own template turns by its own rows'.

## 2. Standard and city chains

- [ ] 2.1 Keep the standard chain and the city chain as the game reads them. Verify: tests named after 'Rain always turns to clear or cloudy at the next change' and 'A city's weather never turns to rain'.
