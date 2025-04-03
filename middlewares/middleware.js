import express from 'express';

export const middleWare = () => {
    const app = express();
    app.use(express.json());
}