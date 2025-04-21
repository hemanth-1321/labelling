import express from "express";
import UserRoutes from "./routes/userRoutes";
import WorkerRoutes from "./routes/workerRoutes";
const app = express();

app.use(express.json());

export const JWT_SECRET = "hemanth";
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/worker", WorkerRoutes);
app.listen(3000, () => {
  console.log("server is running");
});
