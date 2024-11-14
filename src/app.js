import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import icapsRouter from './routes/icapsMasterRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());

const DB_URL = process.env.DB_URL;

app.use('/icaps', icapsRouter)

async function connectDB() {
    try {
        await mongoose.connect(DB_URL);
        console.log(`Connected to ${DB_URL}`);
    } catch (error) {
        console.error(`Error connecting to ${DB_URL}`, error);
    }
}

connectDB();

export default app;