'use client'

import{Box, Button, Stack, TextField} from '@mui/material'
import {useState} from 'react'

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hello! I help you today?"
    },
  ])
  const [message, setMessage] = useState("")

  const sendMessage = async () => {
   if(!message.trim()) return;

    setMessage('')
    setMessages((messages)=>[
      ...messages,
      {role: 'user', content: message},
      {role: 'assistant', content:''},
    ])

    const response = fetch('/api/chat',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, {role: 'user', content:message}]),
    }).then(async (res)=>{
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({done,value}){
        if(done){
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), {stream:true})
        setMessages((messages)=>{
          console.log(messages)
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return[
            ...otherMessages,
            {...lastMessage, content: lastMessage.content + text},
          ]
        })
        return reader.read().then(processText)
      })
    })
  }
  return (
   <Box>
    <Stack>
      <Stack>
        {messages.map((message,index)=>(
          <Box key={index}>
            <Box>
              {message.content}
            </Box>
          </Box>
        ))}
      </Stack>
      <Stack>
        <TextField value={message} onChange={(e)=> setMessage(e.target.value)}/>
        <Button variant='contained' onClick={sendMessage}>Send</Button>
      </Stack>
    </Stack>
   </Box>
  );
}
