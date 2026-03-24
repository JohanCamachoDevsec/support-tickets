import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, type Relation } from "typeorm";
import type { User } from "./User.js";
import type { Ticket } from "./Ticket.js";


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

  @ManyToOne("User", (user: any) => user.historyActions)  // 👈 string
  changedBy!: Relation<User>;  // 👈 Relation<>

  @ManyToOne("Ticket", (ticket: any) => ticket.history)   // 👈 string
  ticket!: Relation<Ticket>;   // 👈 Relation<>

  @CreateDateColumn()
  createdAt!: Date;
}
