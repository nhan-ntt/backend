import express from "express";
import { PORT } from "./config/environments.js";
// import swaggerDocs from "./config/swagger.js";

import { connectDB } from "./config/database.js";

import roleRoutes from "./routes/role.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import predictRoutes from "./routes/predict.route.js";
import planRoutes from "./routes/plan.route.js";
import pestLevelRoutes from "./routes/pest-level.route.js";
import reportRoutes from "./routes/report.route.js";


const app = express();
app.use(express.json());

app.use("/api/role", roleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", predictRoutes);
app.use("/api", planRoutes);
app.use("/api", pestLevelRoutes);
app.use("/api", reportRoutes);

app.get("/", (req, res) => {
    res.send("Hello World");
})

// swaggerDocs(app); // Initialize Swagger

app.listen(PORT, () => {
    connectDB();
    console.log("Server started on port " + PORT);
})
