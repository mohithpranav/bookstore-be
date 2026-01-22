import express from "express";
import cors from "cors";
import passport from "passport";
import setupPassport from "./config/passport.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize passport and strategies
setupPassport(passport);
app.use(passport.initialize());

app.use("/", userRoutes);

export default app;
