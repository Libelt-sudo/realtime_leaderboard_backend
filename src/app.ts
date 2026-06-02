import 'dotenv/config';
import express from 'express';

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { createServer } from "http";
import { Server } from 'socket.io';

import { redisClient } from './redis_client.ts';

import { validateData } from './middleware/validationMiddleware.js';
import { userRegisterationSchema, userUpdateSchema } from './schemas/userSchema.js';
import { handleRegisteration, handleUpdate } from './handlers/userHandlers.js';
import { loadData } from './services.ts';

const app = express();
app.use(express.json());
const server = createServer(app);
const io = new Server(server); 

await redisClient.connect();

const PORT = 3000;

await loadData();

app.post('/add', validateData(userRegisterationSchema), handleRegisteration);
app.post('/update/:username', validateData(userUpdateSchema), handleUpdate)



server.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});