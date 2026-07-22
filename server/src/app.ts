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

app.listen(3000);