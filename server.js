//Imports
import express from 'express';
import { connectDB } from './config/db.js';
import { User } from './models/users.js';
import { middleWare } from './middlewares/middleware.js';

await connectDB();
await middleWare();

const app = express();
const PORT = 4321;

//Bara för att testa en bas-route
app.get('/', (req, res) => {
    res.send('Hello world!')
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
