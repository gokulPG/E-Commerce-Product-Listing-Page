import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number().int().positive(),
  currency: z.literal("INR"),
  images: z.array(
    z.object({
      url: z.string(),
      alt: z.string(),
      width: z.number(),
      height: z.number(),
    })
  ).min(1),
  category: z.enum(["beans", "brewers", "grinders", "accessories"]),
  rating: z.number().min(0).max(5),
  ratingCount: z.number().int().nonnegative(),
  roastLevel: z.enum(["light", "medium", "dark"]).optional(),
  inStock: z.boolean(),
  createdAt: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;