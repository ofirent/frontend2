const express = require("express");
const cors = require("cors");
require("dotenv").config();

const feedingsRoutes = require("./routes/feedings");
const budgetRoutes = require("./routes/budget");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/feedings", feedingsRoutes);
app.use("/api/budget", budgetRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
