import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = () => {
  mongoose
    .connect(process.env.CONN_STRING)
    .then(() => {
      console.log("connected to db");
    })
    .catch((error) => {
      console.log("database connection error");
      console.log(error);
    });
};

export { connectDb };
