import { type Request, type Response } from 'express';
import { prisma } from "../lib/prisma.js"
import { redisClient } from '../redis_client.ts';
import type { Server } from 'socket.io';

const getLeaderboardScores = async () => {
    const leaderboard_scores = await redisClient.zRangeWithScores("leaderboard", 0, -1, {REV: true});
    console.log(leaderboard_scores);
    return leaderboard_scores;
}

export const handleOnConnection = async (socket) => {
    const leaderboardScores = await getLeaderboardScores();
    socket.emit("leaderboard:update", {leaderboard: leaderboardScores});
}

export const handleRegisteration = async (req: Request, res: Response, io: Server) => {
    try{
        const user = await prisma.user.create({
            data: {
                username: req.body["username"]
            }
        });
        
        await redisClient.ZADD("leaderboard", {score: user.score, value: user.username});
        await redisClient.zRangeWithScores("leaderboard", 0, -1, { REV: true });

        const leaderboardScores = await getLeaderboardScores();
        io.emit("leaderboard:update", {leaderboard: leaderboardScores});

        res.json({ response: `Added ID: ${user.id} ${user.username} to the leaderboard` });
    }
    catch (e){
        console.error('Error creating user:', e);
        return res.status(500).json({ 
            error: 'Failed to create user' 
        });
    }
};


export const handleUpdate = async (req: Request, res: Response, io: Server) => {
    try{    

        const raw = req.params["username"];
        const username = typeof raw === 'string' ? raw : undefined;

        if (username === undefined){
            throw new Error("path parameter 'username' not provided!")
        }

        
        const user = await prisma.user.update({
            where: {username: username},
            data: {score: {increment: req.body["score"]}}
        });
    
        redisClient.ZINCRBY("leaderboard", req.body["score"], user.username);
        await redisClient.zRangeWithScores("leaderboard", 0, -1, { REV: true });

        const leaderboardScores = await getLeaderboardScores();
        io.emit("leaderboard:update", {leaderboard: leaderboardScores});

        res.json({response: `Updated user: ${user.username}'s score to [SCORE: ${user.score}, RANK: ${user.ranking}]`});
        
    }catch (e){
        console.error('Error creating user:', e);
        return res.status(500).json({ 
            error: 'Failed to update user score' 
        });
    }
};

export const handleGet = async (req: Request, res: Response, io: Server) => {
    const leaderboard_scores = getLeaderboardScores();
    res.json({response: leaderboard_scores});
};
