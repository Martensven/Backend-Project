const express = require('express');
const app = express();

const coffeeRoutes = require('../routes/menu');

app.use(express.json());


app.use('/api', coffeeRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servern körs på port ${PORT}`));
