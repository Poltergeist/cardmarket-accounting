import { z } from "zod";

export const articlesImportCsvSchema = z.object({
  "Shipment nr.": z.string(),
  "Date of purchase": z.string().transform((date) => new Date(date)),
  Article: z.string(),
  "Product ID": z.string(),
  "Localized Product Name": z.string(),
  Expansion: z.string(),
  Category: z.string(),
  Amount: z.coerce.number(),
  "Article Value": z.coerce.number(),
  Total: z.coerce.number(),
  Currency: z.string(),
  Comments: z.string(),
});
