import express from "express";
import dotenv from "dotenv"
import { networkInterfaces } from "os"
import { graphqlHTTP } from "express-graphql";
/********************************************/
import rootSchema from "./schemas/rootSchema.js"

dotenv.config();
const app = express();

app.use(
    '/graphql',
    graphqlHTTP({
        schema: rootSchema,
        graphiql: true
    })
)

app.get('/', (req, res)=>{
    res.send('Welcome')
    console.log(`Client connected => IP(${req.ip})`);
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, ()=>{
    console.log(`Current Device : 127.0.0.1:${PORT}`);
    console.log(`Current Network: ${!networkInterfaces().wlan0 ? "Not connected" : networkInterfaces().wlan0[0].address+":"+PORT}`);
})
