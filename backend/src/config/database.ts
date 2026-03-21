import { DataSource } from "typeorm";
import { User } from "../entities/User.js";
import { Ticket } from "../entities/Ticket.js";
import { TicketComment } from "../entities/TicketComment.js";
import { TicketHistory } from "../entities/TicketHistory.js";
import { TicketSubscriber } from "../subscribers/TicketSubscriber.js";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [User, Ticket, TicketComment, TicketHistory],
  migrations: ["src/migrations/*.ts"],
  subscribers: [TicketSubscriber]
});
