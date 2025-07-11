
import dotenv from 'dotenv';

dotenv.config();

import express from 'express'; 
import cors from 'cors'; 
import color from 'picocolors';

import { connectDB } from './configuration/database.js'; 

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import reportRoutes from './routes/reportsRoutes.js';



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
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/reports', reportRoutes);

const URL = process.env.APP_URL || 'http://localhost'; 
const PORT = process.env.PORT || 7000; 

app.listen( PORT, () => {
    console.log(`Server is running on: ${color.cyan(`${URL}:${PORT}`)}`); 
});

