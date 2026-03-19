import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { IsEnum, IsNotEmpty } from "class-validator";
import { User } from "./User.js";
import { TicketComment } from "./TicketComment.js";
import { TicketHistory } from "./TicketHistory.js";

/**
 * Estados posibles.
 */
export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED"
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

  @Column()
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

  @ManyToOne(() => User, (user) => user.createdTickets)
  createdBy!: User;

  @ManyToOne(() => User, (user) => user.assignedTickets, { nullable: true })
  assignedTo!: User | null;

  @OneToMany(() => TicketComment, (comment) => comment.ticket)
  comments!: TicketComment[];

  @OneToMany(() => TicketHistory, (history) => history.ticket)
  history!: TicketHistory[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

}
