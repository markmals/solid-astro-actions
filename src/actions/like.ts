import { getApiContext } from "astro/actions/runtime/store.js";
import { AstroError } from "astro/errors";
import { db, and, eq, Like } from "astro:db";
import { sleep } from "../lib/sleep";
import { z } from "astro:actions";
import { fetchCurrentUser } from "../lib/fetchCurrentUser";

export const likeSchema = z.object({ postId: z.number() });

export async function likePost({ postId }: z.infer<typeof likeSchema>) {
    // Simulate server slowness
    await sleep(1000);

    // Simulate random faiulre
    if (Math.random() < 0.1) {
        console.error("[RANDOM LIKE FAILURE]:", postId, "cannot be liked... for random reasons");
        throw new AstroError("Fail");
    }

    const sqlFilter = and(eq(Like.postId, postId), eq(Like.userId, 1));

    // TODO: Log-in, log-out, & users
    const currentUser = await fetchCurrentUser(getApiContext());

    const existingLike = await db.select().from(Like).where(sqlFilter).get();

    if (existingLike) {
        await db.delete(Like).where(sqlFilter);
    } else {
        await db.insert(Like).values({ postId, userId: currentUser.id });
    }

    const likes = await db.select().from(Like).where(eq(Like.postId, postId));
    const likeCount = likes.length;

    return likeCount;
}
