import z from "zod";

export const processSchema = z.object({
  typeProcess: z
    .string()
    .min(1, "El proceso debe tener al menos 1 caracter")
    .max(20, "El proceso no debe tener mas de 20 caracteres"),
  observations: z.string().optional(),
});
