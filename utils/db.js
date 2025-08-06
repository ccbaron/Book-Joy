import {connect} from "mongoose";

export async function connectDB() {

    const { MONGODB_URI } = process.env;

    await connect(`${MONGODB_URI}`);
    console.log("Conectado a la base de datos correctamente.")
}