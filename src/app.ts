import 'dotenv/config';
import express from 'express';
import { type Request, type Response } from 'express';

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { createServer } from "http";
import { Server } from 'socket.io';
import cors from "cors";

import { redisClient } from './redis_client.ts';

import { validateData } from './middleware/validationMiddleware.js';
import { userRegisterationSchema, userUpdateSchema } from './schemas/userSchema.js';
import { handleRegisteration, handleUpdate, handleGet, handleOnConnection } from './handlers/userHandlers.js';
import { loadData } from './services.ts';


const app = express();
const PORT = 3000;



const corsOptions = {
  origin: ["http://localhost:5174"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Express HTTP routes
app.use(cors(corsOptions));


const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: corsOptions
}); // Instnace of socket.io server

// Middleware to parse json
app.use(express.json());

// Connecting redis client intsance to redis server
await redisClient.connect();

await loadData();


app.post('/add', validateData(userRegisterationSchema), async (req: Request, res: Response)=> handleRegisteration(req, res, io));
app.post('/update/:username', validateData(userUpdateSchema), async (req: Request, res: Response)=> handleUpdate(req, res, io))
app.get('/leaderboardstats', async (req: Request, res: Response)=> handleGet(req, res, io));


io.on("connection", async (socket) => {
    console.log("User connected.");
    await handleOnConnection(socket);
    socket.on("disconnect", () => {console.log("User disconnected.");});
    
    
});


httpServer.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});