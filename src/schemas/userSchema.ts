import z from 'zod'

const RankEnum = z.enum(['COPPER', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'EMERALD', 'KOBOLT']);

export type Rank = z.infer<typeof RankEnum>;

export const userRegisterationSchema = z.object({
    username: z.string()
});

export const userUpdateSchema = z.object({
    score:      z.number(),
});

export const userResponseSchema = z.object({
    id:         z.number(),
    username:   z.string(),
    score:      z.number(),
    rank:       RankEnum,
});

