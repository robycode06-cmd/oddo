import express from "express";
import dtoenv from "dotenv";
import connectDB from "./src/db_connect.js";
import cors from "cors";


//config
dtoenv.config();

//connect with DB
connectDB(process.env.URL)
.then(()=>{console.log("Mongo Db is connected")})
.catch((error)=>{console.log("Mongo err",error)})

//handler
const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));




//listener
app.listen(process.env.PORT,()=>{console.log("Server is started at port",process.env.PORT)})