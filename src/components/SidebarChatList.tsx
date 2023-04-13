"use client"
import { chatHrefConstructor } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import React, { FC, useEffect, useState } from 'react'
interface SidebarChatListprops{
    friends : User[]
    sessionId: string
}
const SidebarChatList:FC<SidebarChatListprops> = ({friends,sessionId}) => {
    const router = useRouter()
    const pathName = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    useEffect(()=>{
        if(pathName?.includes('chat')){
            setUnseenMessages((prev)=>{
                return prev.filter((msg)=> !pathName.includes(msg.senderId))
            })
        }
    },[pathName])
  return (
    <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1' >
        {friends.sort().map(friend =>{
            const unSeenMessagesCount = unseenMessages.filter(message => {
                return message.senderId === friend.id
            } ).length
            return (
                <li key={friend.id}>
                    <a href={`/dashboard/chat/${
                        chatHrefConstructor(
                            sessionId, friend.id)}`}>
                                Hello
                            </a>
                </li>
            )
        })}
        
    </ul>
  )
}

export default SidebarChatList