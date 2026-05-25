import express from 'express';

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { createServer } from "http";
import { Server } from 'socket.io';

import { validateData } from './middleware/validationMiddleware.js';
import { userRegisterationSchema, userUpdateSchema } from './schemas/userSchema.js';
import { handleRegisteration, handleUpdate } from './handlers/userHandlers.js';

const app = express();
const server = createServer(app);
const io = new Server(server); 

const PORT = 3000;


app.use(express.json());


app.post('/add', validateData(userRegisterationSchema), handleRegisteration);
app.post('/update/:username', validateData(userUpdateSchema), handleUpdate)



server.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});