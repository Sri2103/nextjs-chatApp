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
                    <a 
                     className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                    href={`/dashboard/chat/${
                        chatHrefConstructor(
                            sessionId, friend.id)}`}>
                                {friend.name}
                                {unSeenMessagesCount>0 ? (
                                <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center '>
                                    {unSeenMessagesCount}
                                </div>
                                ) : undefined }
                            </a>
                </li>
            )
        })}
        
    </ul>
  )
}

export default SidebarChatList