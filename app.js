import express from "express";
import { env } from "./config/env.js";
import router from "./routes/wildlife.routes.js";
import {authrouter} from "./routes/auth.routes.js";
import flash from "connect-flash";
import session from "express-session";
import { verifyAuthentication } from "./middlewares/auth-verify-middleware.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(session({secret:"firstProject",resave:true, saveUninitialized:false}));
app.use(flash());
app.use(verifyAuthentication);
app.use((req,res,next)=>{
    res.locals.user = req.user;
    return next();
});
app.use(authrouter);
app.use(router);

app.listen(env.PORT,()=>{
    console.log(`Server started on port ${env.PORT}`);
})