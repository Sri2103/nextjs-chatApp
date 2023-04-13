import Image from 'next/image'
import { Inter } from 'next/font/google'
import { db } from '@/lib/db'

const inter = Inter({ subsets: ['latin'] })

export default async function Home() {
  await db.set('hello', 'hello')
  return (
    <div className='text-red-400'>Hello world</div>
  )
}
