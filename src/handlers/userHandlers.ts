import { type Request, type Response } from 'express';
import { prisma } from "../lib/prisma.js"
import { assert } from 'node:console';
import { string } from 'zod';


export const handleRegisteration = async (req: Request, res: Response) => {
    try{
        const user = await prisma.user.create({
            data: {
                username: req.body["username"]
            }
        });

        res.json({ response: `Added ${user.username} to the leaderboard` });
    }
    catch (e){
        console.error('Error creating user:', e);
        return res.status(500).json({ 
            error: 'Failed to create user' 
        });
    }
};


export const handleUpdate = async (req: Request, res: Response) => {
    try{    

        const raw = req.params["username"];
        const username = typeof raw === 'string' ? raw : undefined;

        if (username === undefined){
            throw new Error("path parameter 'username' not provided!")
        }

        const user = await prisma.user.update({
            where: {username: username},
            data: {score: req.body["score"]}
        });

        res.json({ response: `Updated user: ${user.username}'s score to [SCORE: ${user.score}, RANK: ${user.ranking}]` });
        
    }catch (e){
        console.error('Error creating user:', e);
        return res.status(500).json({ 
            error: 'Failed to update user score' 
        });
    }
}