
import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectedDB = async ()=>{
    try {
        const connectionInstances = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connected !! DB HOST ${connectionInstances.connection.host} ` );
    } catch (error) {
        console.log("ERROR:",error);
        process.exit(1)
    }
}

export default connectedDB