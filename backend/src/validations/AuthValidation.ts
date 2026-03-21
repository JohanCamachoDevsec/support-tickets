import { z } from "zod";
/**
 * validaciones para el registro y login
 */
export const registerSchema = z.object({
    email: z.string().email("Formato de email inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres")
});

export const loginSchema = z.object({
    email: z.string().email("Formato de email inválido"),
    password: z.string().min(1, "La contraseña es requerida")
});
