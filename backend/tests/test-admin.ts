import "reflect-metadata";
import { AppDataSource } from "../src/config/database.js";
import * as authService from "../src/services/AuthService.js";
import { User, UserRole } from "../src/entities/User.js";

/**
 * Script de prueba para validar la creación administrativa de agentes y otros admins.
 */
async function testAdminFlow() {
  try {
    console.log("Iniciando Test de Gestión Administrativa de Usuarios...");

    await AppDataSource.initialize();
    console.log("Conexión a la base de datos establecida.");

    const userRepository = AppDataSource.getRepository(User);

    // 1. Preparar un Administrador "semilla"
    const adminEmail = "admin@soporte.com";
    let admin = await userRepository.findOneBy({ email: adminEmail });

    if (!admin) {
        console.log("Creando administrador inicial...");
        const result = await authService.register({
            name: "Admin",
            email: adminEmail,
            password: "Admin123123",
            role: UserRole.ADMIN
        });
        admin = await userRepository.findOneBy({ id: result.user.id });
    }
    console.log(`Administrador listo: ${admin?.email}`);

    // 2. Simular creación de un AGENTE por parte del admin
    console.log("\nSimulando creación de un Agente...");
    const agentData = {
        name: "Agente de Soporte",
        email: "agent.one@soporte.com",
        password: "passwordAgente123",
        role: UserRole.AGENT
    };

    // Limpieza previa del agente
    const existingAgent = await userRepository.findOneBy({ email: agentData.email });
    if (existingAgent) await userRepository.remove(existingAgent);

    // En la vida real esto pasaría por el UserController
    // Aquí probamos el servicio con el rol explícito
    const agentResult = await authService.register(agentData);
    console.log("Agente creado con éxito:", agentResult.user);

    if (agentResult.user.role === UserRole.AGENT) {
        console.log("Verificación de Rol AGENTE: OK");
    }

    // 3. Simular creación de otro ADMIN
    console.log("\nSimulando creación de otro Administrador...");
    const newAdminData = {
        name: "Admin Secundario",
        email: "admin.two@soporte.com",
        password: "passwordAdmin456",
        role: UserRole.ADMIN
    };

    const existingAdmin2 = await userRepository.findOneBy({ email: newAdminData.email });
    if (existingAdmin2) await userRepository.remove(existingAdmin2);

    const newAdminResult = await authService.register(newAdminData);
    console.log("Admin secundario creado con éxito:", newAdminResult.user);

    if (newAdminResult.user.role === UserRole.ADMIN) {
        console.log("Verificación de Rol ADMIN: OK");
    }

    console.log("\nTest administrativo finalizado correctamente.");

  } catch (error: any) {
    console.error("\nError durante el test:", error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("\nConexión cerrada.");
    }
  }
}

testAdminFlow();
