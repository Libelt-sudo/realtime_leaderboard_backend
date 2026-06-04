import { redisClient} from "./redis_client.ts";
import { Prisma } from "./generated/client.ts";
import { prisma } from "./lib/prisma.ts";


export const loadData = async () => {
    if (await redisClient.EXISTS("leaderboard") && await redisClient.zCard("leaderboard") > 0){
        return;
    }

    console.log("Leaderboard does not exist or exists with no data");

    const users = await prisma.user.findMany();

    const pipline = redisClient.multi();

    // Batches ZADD calls.
    users.forEach(user => {
        pipline.zAdd("leaderboard", {score: user.score, value: user.username});
    });

    await pipline.exec();
};