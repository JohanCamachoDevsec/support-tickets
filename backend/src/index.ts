import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Confiar en el proxy inverso (Nginx)
app.set("trust proxy", 1);

// Configuración de CORS
// Se permite cualquier origen para que funcione con cualquier IP/dominio (según requerimiento)
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Registro de rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/audit", auditRoutes);

// Ruta de salud del sistema
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Inicialización de la base de datos y arranque del servidor
console.log("DEBUG - Variables de DB:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  hasPassword: typeof process.env.DB_PASSWORD === 'string'
});
AppDataSource.initialize()
  .then(() => {
    console.log("Conexión a la base de datos establecida correctamente");
    app.listen(PORT, () => {
      console.log(`Servidor iniciado correctamente`);
      console.log(`Corriendo en este url: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar a la base de datos:", error);
  });
