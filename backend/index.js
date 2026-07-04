import express from "express";
import dtoenv from "dotenv";
import {connectDB} from "./src/db_connect.js";
import cors from "cors";
import user_router from "./src/routes/userSignup.js";
import login_router from "./src/routes/login_route.js";
import cookieParser from "cookie-parser";



//config
dtoenv.config();

//connect with DB
connectDB(process.env.URL)
.then(()=>{console.log("Mongo Db is connected")})
.catch((error)=>{console.log("Mongo err",error)})

//handler
const app = express();

//middlewares
app.use(cors({origin: 'http://localhost:5173',credentials: true}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use('/create',user_router);
app.use('/login',login_router)




//listener
app.listen(process.env.PORT,()=>{console.log("Server is started at port",process.env.PORT)})