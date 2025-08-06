import { connect } from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables del archivo .env
dotenv.config();

export async function connectDB() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error("❌ No se encontró MONGODB_URI en el archivo .env");
  }

  await connect(MONGODB_URI);
  console.log("✅ Conectado a la base de datos correctamente.");
}
