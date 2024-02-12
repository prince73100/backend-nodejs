// require('dotenv').config({path:"./env"})
import dotenv from "dotenv";

import connectedDB from './db/index.js'

dotenv.config({
    path:"./env"
})

connectedDB()


// First Approach to connect DB
/*
import express from "express";
const app = express();
(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("Not Able to connect : ",(error)=>{
            console.log(error);
        })
        app.listen(process.env.PORT,()=>{
            console.log("App is now listening");
        })
    } catch (error) {
        console.error("ERROR: ",error)
        throw error
    }
})()
*/