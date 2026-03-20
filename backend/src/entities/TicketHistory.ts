import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User.js";
import { Ticket } from "./Ticket.js";

/**
 * Entidad que rastrea los cambios de estado en un ticket.
 * Permite mantener un historial de auditoría de todas las transiciones.
 */
@Entity()
export class TicketHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  field!: string;

  @Column({ type: "varchar", nullable: true })
  oldValue!: string;

  @Column({ type: "varchar", nullable: true })
  newValue!: string;

  @ManyToOne(() => User, (user) => user.historyActions)
  changedBy!: User;

  @ManyToOne(() => Ticket, (ticket) => ticket.history)
  ticket!: Ticket;

  @CreateDateColumn()
  createdAt!: Date;
}
