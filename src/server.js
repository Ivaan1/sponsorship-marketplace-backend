import app from './app.js'
import dbConnect from './config/mongo.js'

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor listo en http://localhost:${port}`);
});

dbConnect();