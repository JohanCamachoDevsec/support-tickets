import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { IsNotEmpty, IsBoolean } from "class-validator";
import { User } from "./User.js";
import { Ticket } from "./Ticket.js";

/**
 * Entidad que representa un comentario en un ticket.
 * Se incluye la funcionalidad de comentarios internos/ocultos entre agentes.
 */
@Entity()
export class TicketComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  @IsNotEmpty({ message: "El contenido del comentario no puede estar vacío" })
  content!: string;

  @Column({ default: false })
  @IsBoolean({ message: "El campo isInternal debe ser booleano" })
  isInternal!: boolean;

  @ManyToOne(() => User, (user) => user.comments)
  author!: User;

  @ManyToOne(() => Ticket, (ticket) => ticket.comments)
  ticket!: Ticket;

  @CreateDateColumn()
  createdAt!: Date;
}
