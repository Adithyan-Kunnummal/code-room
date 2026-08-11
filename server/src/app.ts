import express, { type Express, type Request, type Response } from 'express'
import cors from 'cors'
import axios from 'axios'

const app: Express = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.use(cors())
app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
    res.send('Hello World!')
})

app.post("/execute", async (req: Request, res: Response) => {
    try {
        const data = await axios.post(
            "http://localhost:2000/api/v2/execute",
            req.body
        )

        res.send(data.data.run.stdout)
    } catch (error) {
        console.log(error)
        res.status(502).json({ error: 'Code execution failed.' })
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})