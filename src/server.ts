import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./router/user.router";

const app = express();
dotenv.config();

mongoose.connect(process.env.MONGODB_URL || "")
.then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

// app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api/users", userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 1`);
});
