import catalogueJson from "#src/data/catalogue.json";
import { catalogueSchema } from "#src/models/world/Catalogue";

// The catalogue every view reads, imported with the world's code and checked against its schema as it loads
export const catalogue = catalogueSchema.parse(catalogueJson);
