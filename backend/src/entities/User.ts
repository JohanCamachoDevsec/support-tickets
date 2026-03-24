import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from "class-validator";
import type {Relation} from "typeorm";
import { Ticket } from "./Ticket.js";
import type { TicketComment } from "./TicketComment.js";
import type { TicketHistory } from "./TicketHistory.js";
/**
 * roles posibles en el sistema.
 */
export enum UserRole {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  CLIENT = "CLIENT"
}

/**
 * Entidad que representa a un usuario del sistema.
 * control de acceso y seguridad.
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  @IsNotEmpty({ message: "El nombre es obligatorio" })
  name!: string;

  @Column({ type: "varchar", unique: true })
  @IsEmail({}, { message: "El email debe ser válido" })
  email!: string;

  @Column({ type: "varchar", select: false }) // La contraseña no se incluye en consultas por defecto
  @IsNotEmpty({ message: "La contraseña es obligatoria" })
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.CLIENT
  })
  @IsEnum(UserRole, { message: "Rol no válido" })
  role!: UserRole;

  @OneToMany(() => Ticket, (ticket) => ticket.createdBy)
  createdTickets!: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.assignedTo)
  assignedTickets!: Ticket[];

  @OneToMany("TicketComment", (comment: any) => comment.author)
  comments!: Relation<TicketComment[]>;

  @OneToMany("TicketHistory", (history: any) => history.changedBy)
  historyActions!: Relation<TicketHistory[]>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
