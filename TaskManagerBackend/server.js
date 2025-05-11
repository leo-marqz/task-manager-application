

import dotenv from 'dotenv'; // Load environment variables from .env file

dotenv.config(); // Load environment variables from .env file

import express from 'express'; 
import cors from 'cors'; 
import color from 'picocolors';

import { connectDB } from './configuration/database.js'; 

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';


const app = express(); 

app.use( cors({
    origin: process.env.CLIENT_URL || '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    // credentials: true, 
}) ); 

connectDB(); 

app.use( express.json() ); 

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/tasks', taskRoutes);
// app.use('/api/v1/reports', boardRoutes);

const URL = process.env.APP_URL || 'http://localhost'; 
const PORT = process.env.PORT || 7000; 

app.listen( PORT, () => {
    console.log(`Server is running on: ${color.cyan(`${URL}:${PORT}`)}`); 
});

