import express from "express";
const app=express();
import cors from "cors";
import {query,connectDB} from "./db.js";
import noteRoutes from "./routes/notes.js"

app.use(express.json());
app.use(cors());
app.use("/api/notes", noteRoutes);
connectDB();
app.listen(5000,()=>{
    console.log('You are listening to the port 5000');
})
