require('dotenv').config();
const express = require("express")

const app = express()

app.use(express.json())

//app.use("/api", require("./routes")) //Lee routes/index.js por defecto

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log("Servidor escuchando en el puerto " + port)
    dbConnect();
})