import express from 'express';

export const middleWare = () => {
    return express.json(); // Returnerar bara express.json() middleware
}