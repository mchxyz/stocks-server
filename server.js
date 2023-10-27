const express = require("express");
require("dotenv").config();
require("./config/db");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));

app.listen(PORT, () => {
  console.log("server listening from port " + PORT);
});
