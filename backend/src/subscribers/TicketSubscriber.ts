import { type EntitySubscriberInterface,  EventSubscriber, type UpdateEvent } from "typeorm";
import { Ticket } from "../entities/Ticket.js";
import { TicketHistory } from "../entities/TicketHistory.js";

/**
 * Suscriptor para registrar cambios de estado y prioridad en un historial.
 */
@EventSubscriber()
export class TicketSubscriber implements EntitySubscriberInterface<Ticket> {
  listenTo() {
    return Ticket;
  }

  async afterUpdate(event: UpdateEvent<Ticket>): Promise<void> {
    const { entity, databaseEntity, manager } = event;

    if (!entity || !databaseEntity) return;

    const changes: TicketHistory[] = [];

    if (entity.status !== undefined && entity.status !== databaseEntity.status) {
      changes.push(this.createHistoryEntry(event, "status", databaseEntity.status, entity.status));
    }

    // Comparamos la prioridad
    if (entity.priority !== undefined && entity.priority !== databaseEntity.priority) {
      changes.push(this.createHistoryEntry(event, "priority", databaseEntity.priority, entity.priority));
    }

    if (changes.length > 0) {
      await manager.save(changes);
    }
  }

  /**
   * Helper para instanciar un registro de historial con los metadatos correspondientes.
   */
  private createHistoryEntry(
    event: UpdateEvent<Ticket>,
    field: string,
    oldValue: string,
    newValue: string
  ): TicketHistory {
    const history = new TicketHistory();
    history.field = field;
    history.oldValue = oldValue;
    history.newValue = newValue;
    history.ticket = event.databaseEntity;

    // Como se determina quién hizo el cambio:
    // El usuario pasado explícitamente en la propiedad transitoria 'updatedBy'.
    // En el caso de que no usamos el creador original.
    history.changedBy = (event.entity as Ticket).updatedBy || event.databaseEntity.createdBy;

    return history;
  }
}

