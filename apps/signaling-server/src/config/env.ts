import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  CLIENT_URL: z.url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
