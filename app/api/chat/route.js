import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
You are a highly knowledgeable and empathetic customer support assistant. Your role is to assist customers by answering their questions, resolving issues, and providing helpful information about our products and services. 

Please ensure that your responses are:
1. Clear and concise.
2. Friendly and professional.
3. Relevant to the customer's inquiry.
4. If you don't have the information or can't resolve an issue, guide the customer on how they can get further help.

Your responses should be based on the most accurate and up-to-date information available. Use a polite and positive tone, and strive to make each interaction a pleasant experience for the customer.

If at any point you are unsure about the answer, ask for more details or suggest contacting a human representative for further assistance.
`

export async function POST(req){
    const  openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [{role: 'system', content: systemPrompt}, ...data],
        model: 'gpt-4o',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if(content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch(err){
                controller.error(err)
            } finally{
                controller.close()
            }
        }
    })
    return new NextResponse(stream)
}