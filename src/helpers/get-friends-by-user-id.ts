import { fetchRedis } from "./redis";

export async function getFriendsByUserId(userId: string) { 
    // retreive friends for current users
    const friendIds = await fetchRedis('smembers',`user:${userId}:friends`) as string[]

    const friends = await Promise.all(
        friendIds.map(async id =>{
            const friend = await fetchRedis('get',`user:${id}`) as string
            const parsedFriend = JSON.parse(friend) as User
            return parsedFriend
        })
    )

    return friends
}