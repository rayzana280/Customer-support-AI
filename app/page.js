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
   <Box 
    sx={{
      width: '600px', 
      height: '700px', 
      display: 'flex', 
      flexDirection: 'column', 
      border: '2px solid #0C0404', 
      borderRadius: '8px', 
      padding: '16px',
      bgcolor: '#36454F',
    }}
    >
    <Stack
      sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        marginBottom: '16px',
        paddingRight: '16px',
      }}
    >
      <Stack>
        {messages.map((message,index)=>(
          <Box key={index}
            sx={{ 
              padding: '8px', 
              borderRadius: '4px', 
              marginBottom: '8px',
              color: 'RGB 73, 79, 85',
              backgroundColor: message.role === 'user' ? '#e3f2fd' : '#f1f8e9',
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={{
                maxWidth: '70%', 
                textAlign: 'left', 
                wordWrap: 'break-word',
              }}
              >
              {message.content}
            </Box>
          </Box>
        ))}
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 'auto' }}>
        <TextField 
          value={message} 
          onChange={(e)=> setMessage(e.target.value)} 
          sx={{width: '100%', borderRadius: '4px', backgroundColor: '#fff'}}/>
        <Button 
          variant='contained' 
          onClick={sendMessage}
          sx={{ 
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' }
          }}>
            Send
        </Button>
      </Stack>
    </Stack>
   </Box>
  );
}
