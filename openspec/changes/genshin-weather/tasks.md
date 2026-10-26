## 1. Area templates

- [x] 1.1 Add the weather templates table to the game text dump's fetched tables and fetch it. Verify: the dump holds WeatherExcelConfigData after `pnpm -C scripts genshin:text fetch`. Done without a new entry: the fetch lists every ExcelBinOutput table and replaces each that differs from the install's build, and the refresh that made the dump the install's build holds both weather tables (WeatherExcelConfigData and WeatherTemplateExcelConfigData).
- [ ] 1.2 Give each catalogue area the template of the weather area covering it, with an area whose template is not the standard one turning by its own rows. Verify: a test named after the scenario 'An area with its own template turns by its own rows'. Blocked: the weather areas' outlines are held only in the client's own scene, which waits on the user, and no published table links an area to its template.

## 2. Standard and city chains

- [x] 2.1 Keep the standard chain and the city chain as the game reads them. Verify: tests named after 'Rain always turns to clear or cloudy at the next change' and 'A city's weather never turns to rain'.
