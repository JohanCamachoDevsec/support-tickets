import "reflect-metadata";
import { AppDataSource } from "../src/config/database.js";
import { ticketService } from "../src/services/TicketService.js";
import { User, UserRole } from "../src/entities/User.js";
import { Ticket, TicketStatus, TicketPriority } from "../src/entities/Ticket.js";
import { TicketComment } from "../src/entities/TicketComment.js";

/**
 * Script de prueba para validar restricciones de seguridad y robustez de la lógica de negocio.
 * 1. Violación de Privacidad (CLIENT viendo/comentando tickets ajenos).
 * 2. Acciones Prohibidas (CLIENT cambiando estado/prioridad).
 * 3. Filtro de Contenido (CLIENT no ve comentarios internos).
 * 4. Robustez de la Máquina de Estados (Transiciones ilegales).
 * 5. Flujo de Asignación (ADMIN asignando a AGENT).
 */
async function testViolations() {
  try {
    console.log("Iniciando Pruebas de Violaciones y Robustez...");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log("Conexión a la base de datos establecida.");

    const userRepository = AppDataSource.getRepository(User);
    const ticketRepository = AppDataSource.getRepository(Ticket);
    const commentRepository = AppDataSource.getRepository(TicketComment);

    // Limpieza de datos previos de prueba
    const testEmails = [
      "client1@test.com",
      "client2@test.com",
      "agent1@test.com",
      "admin1@test.com"
    ];

    for (const email of testEmails) {
      const user = await userRepository.findOne({ where: { email }, relations: ["createdTickets"] });
      if (user) {
        // Eliminar tickets asociados (la cascada debería manejar el resto, pero seamos explícitos si es necesario)
        const tickets = await ticketRepository.find({ where: { createdBy: { id: user.id } } });
        for (const t of tickets) {
            await commentRepository.delete({ ticket: { id: t.id } });
            await AppDataSource.getRepository("TicketHistory").delete({ ticket: { id: t.id } });
            await ticketRepository.remove(t);
        }
        await userRepository.remove(user);
      }
    }
    console.log("Limpieza de usuarios de prueba completada.");

    // Crear Usuarios
    const client1 = await userRepository.save(userRepository.create({ name: "Client 1", email: "client1@test.com", password: "password", role: UserRole.CLIENT }));
    const client2 = await userRepository.save(userRepository.create({ name: "Client 2", email: "client2@test.com", password: "password", role: UserRole.CLIENT }));
    const agent1 = await userRepository.save(userRepository.create({ name: "Agent 1", email: "agent1@test.com", password: "password", role: UserRole.AGENT }));
    const admin1 = await userRepository.save(userRepository.create({ name: "Admin 1", email: "admin1@test.com", password: "password", role: UserRole.ADMIN }));

    console.log("Usuarios de prueba creados.");

    // Crear un ticket para client1
    const ticket1 = await ticketService.createTicket({
      title: "Ticket Privado de Client 1",
      description: "Nadie más debería ver esto",
      priority: TicketPriority.LOW
    }, client1);
    console.log(`Ticket creado por Client 1 (ID: ${ticket1.id})`);

    console.log("\n--- TEST 1: Violación de Privacidad (Ver Ticket Ajeno) ---");
    try {
      await ticketService.getTicketById(ticket1.id, client2);
      console.error("FAILED: Client 2 pudo ver el ticket de Client 1");
    } catch (error: any) {
      console.log(`SUCCESS: Capturado error esperado: "${error.message}"`);
    }

    console.log("\n--- TEST 2: Violación de Privacidad (Comentar Ticket Ajeno) ---");
    try {
      await ticketService.addComment(ticket1.id, { content: "Intento de hackeo" }, client2);
      console.error("FAILED: Client 2 pudo comentar en el ticket de Client 1");
    } catch (error: any) {
      console.log(`SUCCESS: Capturado error esperado: "${error.message}"`);
    }

    console.log("\n--- TEST 3: Acciones Prohibidas (Cambio de Estado por CLIENT) ---");
    try {
      // Intentar cambiar de OPEN a IN_PROGRESS (solo AGENT/ADMIN pueden)
      await ticketService.changeStatus(ticket1.id, TicketStatus.IN_PROGRESS, client1);
      console.error("FAILED: Client 1 pudo cambiar el estado a IN_PROGRESS");
    } catch (error: any) {
      console.log(`SUCCESS: Capturado error esperado: "${error.message}"`);
    }

    console.log("\n--- TEST 4: Acciones Prohibidas (Cambio de Prioridad por CLIENT) ---");
    try {
      await ticketService.updatePriority(ticket1.id, TicketPriority.HIGH, client1);
      console.error("FAILED: Client 1 pudo cambiar la prioridad");
    } catch (error: any) {
      console.log(`SUCCESS: Capturado error esperado: "${error.message}"`);
    }

    console.log("\n--- TEST 5: Filtro de Contenido (Comentarios Internos) ---");
    // Admin1 añade un comentario interno
    await ticketService.addComment(ticket1.id, { content: "Nota interna: Cliente difícil", isInternal: true }, admin1);
    // Admin1 añade un comentario público
    await ticketService.addComment(ticket1.id, { content: "Hola, estamos revisando", isInternal: false }, admin1);

    const ticketForClient = await ticketService.getTicketById(ticket1.id, client1);
    const internalComments = ticketForClient?.comments?.filter(c => c.isInternal);
    if (internalComments && internalComments.length === 0) {
      console.log("SUCCESS: Client 1 no ve comentarios internos.");
    } else {
      console.error(`FAILED: Client 1 ve ${internalComments?.length} comentarios internos.`);
    }

    console.log("\n--- TEST 6: Robustez de la Máquina de Estados ---");
    try {
      // Intentar saltar de OPEN a CLOSED directamente
      await ticketService.changeStatus(ticket1.id, TicketStatus.CLOSED, admin1);
      console.error("FAILED: Se permitió transición ilegal de OPEN a CLOSED");
    } catch (error: any) {
      console.log(`SUCCESS: Capturado error esperado: "${error.message}"`);
    }

    console.log("\n--- TEST 7: Flujo de Asignación (ADMIN asigna a AGENT) ---");
    const assignedTicket = await ticketService.assignTicket(ticket1.id, agent1, admin1);
    if (assignedTicket.assignedTo?.id === agent1.id) {
      console.log(`SUCCESS: Ticket asignado correctamente al agente ${agent1.name}`);
    } else {
      console.error("FAILED: No se actualizó correctamente el campo assignedTo");
    }

    console.log("\n--- PRUEBAS COMPLETADAS EXITOSAMENTE ---");

  } catch (error: any) {
    console.error("\n ERROR FATAL durante las pruebas:", error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Conexión a la base de datos cerrada.");
    }
  }
}

testViolations();
