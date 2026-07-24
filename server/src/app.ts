import express, { type Express, type Request, type Response } from 'express';
import supabase from './lib/supabase.js'
import cors from 'cors'
import axios from 'axios'

const app: Express = express();

app.use(cors())
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});   

app.post("/execute", async (req: Request, res: Response) => {
  try{
    const data = await axios.post(
      "http://localhost:2000/api/v2/execute",
      req.body)

    res.send(data.data.run.stdout)
  } catch(error) {
    console.log(error)
  }
   
})

app.post('/rooms/:roomId/join', async(req: Request, res: Response) => {
  const { roomId } = req.params

    // Check if room exists
    const { data: room , error: roomError } = await supabase
      .from('rooms')
      .select()
      .eq('room_id', roomId)
      .single()

    if(roomError || !room) {
      return res.status(404).send("Room not found")
    }

    const token = req.headers.authorization?.split(" ")[1]

    if(!token) {
      return res.status(401).send("Missing authorization header")
    }


    // Verify user
    const {data: { user }, error: userError} = await supabase.auth.getUser(token)

    if(userError || !user) {
      return res.status(401).send("Invatid access token")
    }

    // Add user to room as member
    const { error: memberError } = await supabase
    .from('room_members')
    .upsert({
      room_id: roomId, 
      user_id: user.id
    },
    {
      onConflict: 'room_id,user_id',
      ignoreDuplicates: true
    })

    if (memberError){
      console.log(memberError)
      return res.status(500).send(memberError)
    }
    
    return res.send("Joined room")

})

app.listen(3000);