import { z } from "zod";
import { UserRole } from "../entities/User.js";

/**
 * Esquema para la creación de usuarios por parte de un Administrador.
 * Incluye el campo role para permitir crear AGENT o ADMIN.
 */
export const createUserSchema = z.object({
  email: z.email({ error: "Formato de email inválido" }),
  password: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres" }),
  name: z.string().min(3, { error: "El nombre debe tener al menos 3 caracteres" }),
  role: z.enum(UserRole, {
    error: "Rol no válido"
  })
});
