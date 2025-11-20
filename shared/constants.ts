export const ITEM_CATEGORIES = [
  "Construction Equipment",
  "Heavy Machinery",
  "Electronics",
  "Power Tools",
  "Manufacturing Equipment",
  "Agricultural Equipment",
  "Mining Equipment",
  "Industrial Machinery",
  "Material Handling",
  "Other"
] as const;

export type ItemCategory = typeof ITEM_CATEGORIES[number];
