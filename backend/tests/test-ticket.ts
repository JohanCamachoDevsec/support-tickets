import "reflect-metadata";
import { AppDataSource } from "../src/config/database.js";
import * as authService from "../src/services/AuthService.js";
import { ticketService } from "../src/services/TicketService.js";
import { User, UserRole } from "../src/entities/User.js";
import { Ticket, TicketStatus, TicketPriority } from "../src/entities/Ticket.js";
import { TicketHistory } from "../src/entities/TicketHistory.js";
import { TicketComment } from "../src/entities/TicketComment.js";

/**
 * Script de prueba técnica para validar el flujo completo de soporte.
 * 1. Registro de un nuevo usuario con rol CLIENT.
 * 2. Creación de un ticket de soporte.
 * 3. Cambio de estado del ticket para disparar auditoría.
 * 4. Adición de un comentario público.
 * 5. Verificación de persistencia y registros de auditoría.
 */
async function testTicketFlow() {
  try {
    console.log("Iniciando Prueba Técnica de Flujo de Soporte...");

    // 1. Inicializar conexión a la base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log("Conexión a la base de datos establecida.");

    const userRepository = AppDataSource.getRepository(User);
    const ticketRepository = AppDataSource.getRepository(Ticket);
    const historyRepository = AppDataSource.getRepository(TicketHistory);
    const commentRepository = AppDataSource.getRepository(TicketComment);

    const testEmail = "juan.perez@majasportswear.com";

    // Limpieza previa para repetibilidad del test
    const existingUser = await userRepository.findOneBy({ email: testEmail });
    if (existingUser) {
      // Eliminar tickets asociados primero si existen (dependiendo de las cascadas)
      const userTickets = await ticketRepository.find({ where: { createdBy: { id: existingUser.id } } });
      for (const t of userTickets) {
          await historyRepository.delete({ ticket: { id: t.id } });
          await commentRepository.delete({ ticket: { id: t.id } });
          await ticketRepository.remove(t);
      }
      await userRepository.remove(existingUser);
      console.log(`Usuario previo '${testEmail}' y sus datos eliminados.`);
    }

    // 2. Registro de un nuevo usuario CLIENT
    console.log("\n--- PASO 1: Registro de Usuario CLIENT ---");
    const regData = {
      name: "Juan Perez",
      email: testEmail,
      password: "password123",
      role: UserRole.CLIENT
    };
    const { user: registeredUser } = await authService.register(regData);
    console.log(`Usuario registrado: ${registeredUser.name} (${registeredUser.role})`);

    // Obtenemos la entidad User completa para usarla en los servicios
    const userEntity = await userRepository.findOneBy({ id: registeredUser.id });
    if (!userEntity) throw new Error("No se pudo recuperar el usuario recién creado");

    // 3. Creación de un ticket de soporte
    console.log("\n--- PASO 2: Creación de Ticket de Soporte ---");
    const ticketData = {
      title: "Error en el portal de pagos",
      description: "No puedo completar mi compra usando tarjeta de crédito, sale un error 500.",
      priority: TicketPriority.HIGH
    };

    // El servicio maneja la creación
    const newTicket = await ticketService.createTicket(ticketData, userEntity);
    console.log(`Ticket creado con ID: ${newTicket.id}, Estado: ${newTicket.status}, Prioridad: ${newTicket.priority}`);

    // 4. Cambio de estado (Flujo de Soporte)
    // Para demostrar el TicketSubscriber, cambiamos el estado de OPEN a IN_PROGRESS
    // Nota: Un CLIENT no puede cambiar a IN_PROGRESS según TicketService, así que simulamos acción de AGENTE/ADMIN o permitimos el cambio si es necesario.
    // El TicketService.changeStatus requiere un usuario.

    console.log("\n--- PASO 3: Cambio de Estado (Auditoría via Subscriber) ---");
    // Simulamos un ADMIN para el cambio de estado si es necesario, o usamos el mismo usuario si la lógica lo permite.
    // Según TicketService, CLIENT solo puede REOPEN. Así que usaremos un ADMIN temporal para este paso.

    const adminEmail = "admin.test@majasportswear.com";
    const existingAdmin = await userRepository.findOneBy({ email: adminEmail });
    if (existingAdmin) {
      await userRepository.remove(existingAdmin);
    }
    const adminUser = userRepository.create({
        name: "Admin",
        email: "admin.test@majasportswear.com",
        password: "admin123",
        role: UserRole.ADMIN
    });
    await userRepository.save(adminUser);

    const updatedTicket = await ticketService.changeStatus(newTicket.id, TicketStatus.IN_PROGRESS, adminUser);
    console.log(`Estado del ticket actualizado a: ${updatedTicket.status}`);

    // 5. Adición de un comentario público
    console.log("\n--- PASO 4: Adición de Comentario Público ---");
    const commentData = {
      content: "Estamos revisando el problema con el procesador de pagos.",
      isInternal: false
    };
    const comment = await ticketService.addComment(newTicket.id, commentData, adminUser);
    console.log(`Comentario añadido por ${adminUser.name}: "${comment.content}" (Interno: ${comment.isInternal})`);

    // 6. Verificación de Persistencia y Auditoría
    console.log("\n--- PASO 5: Verificación de Persistencia y Auditoría ---");

    // Verificar Ticket
    const savedTicket = await ticketService.getTicketById(newTicket.id, adminUser);
    if (savedTicket && savedTicket.title === ticketData.title) {
        console.log("✓ Persistencia del Ticket: CORRECTA");
    } else {
        throw new Error("Error en persistencia del Ticket");
    }

    // Verificar Comentario
    if (savedTicket?.comments && savedTicket.comments.length > 0) {
        console.log(`✓ Persistencia del Comentario: CORRECTA (${savedTicket.comments.length} comentario(s))`);
    } else {
        throw new Error("Error en persistencia del Comentario");
    }

    // Verificar Historial de Auditoría (Generado por Subscriber)
    const history = await historyRepository.find({
        where: { ticket: { id: newTicket.id } },
        relations: ["changedBy"]
    });

    if (history.length > 0) {
        console.log(`✓ Historial de Auditoría: CORRECTA (${history.length} registro(s) encontrado(s))`);
        history.forEach(h => {
            console.log(`  - Campo: ${h.field}, De: ${h.oldValue}, A: ${h.newValue}, Por: ${h.changedBy.name}`);
        });
    } else {
        throw new Error("Error: No se generaron registros de auditoría en TicketHistory");
    }

    console.log("\nPrueba Técnica completada EXITOSAMENTE.");

  } catch (error: any) {
    console.error("\n ERROR durante la prueba técnica:", error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Conexión a la base de datos cerrada.");
    }
  }
}

testTicketFlow();
