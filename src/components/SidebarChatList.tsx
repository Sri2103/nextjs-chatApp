"use client"
import { pusherClient } from '@/lib/pusher'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import React, { FC, useEffect, useState } from 'react'
import { type Toast, toast } from 'react-hot-toast'
import UnseenChatToast from './UnseenChatToast'
interface SidebarChatListprops{
    friends : User[]
    sessionId: string
}

interface ExtendedMessage extends Message {
    senderImg: string,
    senderName: string,
}
const SidebarChatList:FC<SidebarChatListprops> = ({friends,sessionId}) => {
    const router = useRouter()
    const pathName = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    
    useEffect(()=>{
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))

        const chatHandler = (message: ExtendedMessage) =>{
          const shouldNotify = pathName !== `/dasboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`
          
          if (!shouldNotify) return

          // toast custom notification
          toast.custom( (t) => (
          <UnseenChatToast
              t={t}
              senderId={message.senderId}
              senderImg={message.senderImg}
              senderName={message.senderName}
              sessionId={sessionId}
              senderMessage={message.text} /> )

        )

          setUnseenMessages(prev => [...prev,message])

        }

        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const friendHandler = () =>{
            router.refresh()
        }

        pusherClient.bind('new_message',chatHandler)

        pusherClient.bind('new_friend',friendHandler)

        return() => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

            pusherClient.unbind('new_message',chatHandler)
            pusherClient.unbind('new_friend',friendHandler)
        }
    },[])


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