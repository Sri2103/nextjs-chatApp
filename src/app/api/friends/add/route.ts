import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req: Request){
    try {
        const body = await req.json()
        const {email: emailToAdd} = addFriendValidator.parse(body.email)

        // const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}`,{
        //     headers:{
        //         Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        //     },
        //     cache: 'no-store',
        // })

        const idToAdd = await fetchRedis('get',`user:email:${emailToAdd}`) as string

        // const data = await RESTResponse.json() as {result : string | null}
        // const idToAdd = data.result

        if(!idToAdd){
            return new Response('This person does not exist', {status:400})
        }
        const session = await getServerSession(authOptions)

        if(!session){
            return new Response('Unauthorized', {status:402})
        }

        if( idToAdd === session.user.id){
            return new Response('You cannot add yourself as a friend', {status:403})
        }

        // check if already added

        const isAlreadyAdded = (await fetchRedis('sismember',`user:${idToAdd}:incoming_friend_requests`, session.user.id)) as 0 | 1

        if (isAlreadyAdded){
            return new Response('You have already added this person as a friend', {status:400})
        }

        // check if already friend

        const isAlreadyFriend = (await fetchRedis('sismember',`user:${session.user.id}:friends`, idToAdd)) as 0 | 1

        if (isAlreadyFriend){
            return new Response('You have already added this person as a friend', {status:400})
        }
        // send friend request
        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')

    } catch (error) {
        if (error instanceof z.ZodError){
            return new Response('Invalid payload', {status:422})
        }

        return new Response('Invalid request', {status:400})
    }
}