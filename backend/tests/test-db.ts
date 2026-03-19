import "reflect-metadata";
import { AppDataSource } from "../src/config/database.js";
import { User } from "../src/entities/User.js";
import { Ticket } from "../src/entities/Ticket.js";
import { TicketComment } from "../src/entities/TicketComment.js";
import { TicketHistory } from "../src/entities/TicketHistory.js";

async function testDatabase() {
  try {
    console.log("Conectando a la base de datos...");
    await AppDataSource.initialize();
    console.log("Conexión establecida.");

    // Verificar cada entidad con una consulta simple (count)
    const entities = [
      { name: "User", entity: User },
      { name: "Ticket", entity: Ticket },
      { name: "TicketComment", entity: TicketComment },
      { name: "TicketHistory", entity: TicketHistory }
    ];

    for (const { name, entity } of entities) {
      const count = await AppDataSource.getRepository(entity).count();
      console.log(`Entidad '${name}': OK (Registros actuales: ${count})`);
    }

    console.log("\nTodas las entidades fueron creadas y están accesibles.");

  } catch (error) {
    console.error("Error al probar la base de datos:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Conexión cerrada.");
    }
  }
}

testDatabase();
