import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany,
  type Relation
} from "typeorm";
import { IsEnum, IsNotEmpty } from "class-validator";
import type { User } from "./User.js";
import type { TicketComment } from "./TicketComment.js";
import type { TicketHistory } from "./TicketHistory.js";
/**
 * Estados posibles.
 */
export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  CLOSED = "CLOSED",
  REOPENED = "REOPENED"
}

/**
 * Prioridades posibles.
 */
export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

/**
 * Entidad que representa un ticket.
 * Con Enums para estados y prioridades.
 */
@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  @IsNotEmpty({ message: "El título es obligatorio" })
  title!: string;

  @Column("text")
  @IsNotEmpty({ message: "La descripción es obligatoria" })
  description!: string;

  @Column({
    type: "enum",
    enum: TicketStatus,
    default: TicketStatus.OPEN
  })
  @IsEnum(TicketStatus, { message: "Estado no válido" })
  status!: TicketStatus;

  @Column({
    type: "enum",
    enum: TicketPriority,
    default: TicketPriority.MEDIUM
  })
  @IsEnum(TicketPriority, { message: "Prioridad no válida" })
  priority!: TicketPriority;

  @ManyToOne("User", (user: any) => user.createdTickets)
  createdBy!: Relation<User>;        // 👈

  @ManyToOne("User", (user: any) => user.assignedTickets, { nullable: true })
  assignedTo!: Relation<User> | null; // 👈

  @OneToMany("TicketComment", (comment: any) => comment.ticket)
  comments!: Relation<TicketComment[]>; // 👈

  @OneToMany("TicketHistory", (history: any) => history.ticket)
  history!: Relation<TicketHistory[]>;  // 👈

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Propiedad para pasar el usuario que realiza el cambio al TicketSubscriber.
   */
  updatedBy?: User;

}
