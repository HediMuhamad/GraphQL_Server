import express from "express";
import dotenv from "dotenv"
import { networkInterfaces } from "os"
import { graphqlHTTP } from "express-graphql";
import mongoose from "mongoose"
/********************************************/
import rootSchema from "./graphQL/rootSchema.js"

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5500;
const MONGODB_LINK = process.env.MONGODB_LOCAL;

mongoose.connect(MONGODB_LINK, {useNewUrlParser: true, useUnifiedTopology: true}, (err)=>{
    err && console.log(err);
});

app.use(
    '/',
    graphqlHTTP({
        schema: rootSchema,
        graphiql: true
    })
)

app.listen(PORT, ()=>{
    console.log(`Current Device : 127.0.0.1:${PORT}`);
    console.log(`Current Network: ${!networkInterfaces().wlan0 ? "Not connected" : networkInterfaces().wlan0[0].address+":"+PORT}`);
})
