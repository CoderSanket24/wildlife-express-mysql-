import express from "express";
import { env } from "./config/env.js";
import router from "./routes/wildlife.routes.js";

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(router);

app.listen(env.PORT,()=>{
    console.log(`Server started on port ${env.PORT}`);
})