import { z } from "zod";

const GermanNumberSchema = z.string().transform((val, ctx) => {
  const normalized = val.replace(",", ".");
  const num = Number(normalized);

  if (isNaN(num)) {
    ctx.addIssue({
      code: "custom",
      message: `Invalid number: "${val}"`,
    });
    return z.NEVER;
  }

  return num;
});

export const salesImportCsvSchema = z.object({
  OrderID: z.string(),
  Username: z.string(),
  Name: z.string(),
  Street: z.string(),
  City: z.string(),
  Country: z.string(),
  "Is Professional": z.coerce.boolean(),
  "VAT Number": z.string(),
  "Date of Purchase": z.string().transform((date) => new Date(date)),
  "Article Count": GermanNumberSchema,
  "Merchandise Value": GermanNumberSchema,
  "Shipment Costs": GermanNumberSchema,
  "Total Value": GermanNumberSchema,
  Commission: GermanNumberSchema,
  Currency: z.string(),
  Description: z.string(),
  "Product ID": z.string(),
  "Localized Product Name": z.string(),
});
