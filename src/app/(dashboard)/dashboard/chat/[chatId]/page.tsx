import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArrayValidator } from '@/lib/validations/messages'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import React, { FC } from 'react'
interface pageprops{
    params:{
        chatId: string
    }
}

const getChatMessages = async(chatId: string) =>{
    try {
        const results:string[] = await fetchRedis('zrange',`chat:${chatId}:messages`, 0, -1)
        const dbMessages = results.map((message)=>{
            return JSON.parse(message) as Message
        })
        const reversedDBmessages = dbMessages.reverse()
        const messages = messageArrayValidator.parse(reversedDBmessages)
        return messages
    } catch (error) {
        notFound()
        
    }
}

const page = async ({params}:pageprops) => {
    const {chatId} = params
    const session = await getServerSession(authOptions)
    if(!session) notFound()
    const {user} = session
    const [userId1, userId2] = chatId.split("--")
    if (user.id !== userId1 && user.id !== userId2){
        notFound()
    }

    const chatPartnerId = user.id === userId1 ? userId2 : userId1
    const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User

    const initialMessage = await getChatMessages(chatId)

  return (
    <div>{params.chatId}</div>
  )
}

export default page