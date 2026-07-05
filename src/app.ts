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
  origin: ["https://leaderboard.luis-seibet.com"],
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


app.post('/api/add',
  (req, res, next) => { console.log('HIT /api/add'); next(); },   // ← add this
  validateData(userRegisterationSchema),
  async (req, res) => handleRegisteration(req, res, io)
);
app.post('/api/update/:username', validateData(userUpdateSchema), async (req: Request, res: Response)=> handleUpdate(req, res, io))
app.get('/api/leaderboardstats', async (req: Request, res: Response)=> handleGet(req, res, io));


io.on("connection", async (socket) => {
    console.log("User connected.");
    await handleOnConnection(socket);
    socket.on("disconnect", () => {console.log("User disconnected.");});
    
    
});


httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`server running at http://localhost:${PORT}`);
});
