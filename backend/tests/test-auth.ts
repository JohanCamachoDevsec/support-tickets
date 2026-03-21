import "reflect-metadata";
import { AppDataSource } from "../src/config/database.js";
import * as authService from "../src/services/AuthService.js";
import { User } from "../src/entities/User.js";
import { UserRole } from "../src/entities/User.js";

/**
 * Script de prueba para validar el flujo de Registro y Login.
 * Este test interactúa directamente con el AuthService para verificar la lógica de negocio,
 * el hasheo de contraseñas y la generación de tokens JWT.
 */
async function testAuthFlow() {
  try {
    console.log("Iniciando Test de Flujo de Autenticación...");

    // Inicializar conexión a la base de datos
    await AppDataSource.initialize();
    console.log("Conexión a la base de datos establecida.");

    const testUser = {
      name: "Cliente de Prueba",
      email: "test.client@majasportswear.com",
      password: "passwordSeguro123",
      role: UserRole.CLIENT
    };

    const userRepository = AppDataSource.getRepository(User);

    // Limpieza de datos de prueba previos
    const existingUser = await userRepository.findOneBy({ email: testUser.email });
    if (existingUser) {
      await userRepository.remove(existingUser);
      console.log(`Usuario previo '${testUser.email}' eliminado para el test.`);
    }

    // Registro
    console.log("\n Registro de nuevo Cliente");
    const registrationResult = await authService.register(testUser);

    console.log("Usuario creado:", registrationResult.user);

    // Login
    console.log("\n Login ");
    const loginResult = await authService.login(testUser.email, testUser.password);

    console.log("Perfil retornado:", loginResult.user);

    // Validamos que el rol sea el correcto
    if (loginResult.user.role === UserRole.CLIENT) {
      console.log("Verificación de Rol: OK (CLIENT)");
    } else {
      console.error("Error: El rol asignado no coincide.");
    }

    if (loginResult.token) {
      console.log("JWT recibido correctamente.");
    }

    // Intento de login con contraseña incorrecta
    console.log("\n Prueba con contraseña incorrecta) ---");
    try {
      await authService.login(testUser.email, "contraaa1");
      console.error(" Error: El sistema permitió el login con contraseña incorrecta.");
    } catch (error: any) {
      console.log("Bloqueo de seguridad OK:", error.message);
    }

    console.log("\n Test de flujo de autenticación finalizado correctamente.");

  } catch (error: any) {
    console.error("\n Error  durante el test:", error.message);
  } finally {
    // Cerrar la conexión para liberar el proceso
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("\n Conexión a la base de datos cerrada.");
    }
  }
}

// Ejecutar el test
testAuthFlow();
