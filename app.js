const express = require('express')
const cors=require('cors')
const UserRouter = require('./Routes/UserRouter')
const connect = require('./config/db')
const BlogRouter = require('./routes/BlogRouter')
require('dotenv').config()

const app=express()
app.use(express.json())
app.use(cors())

app.use('/',UserRouter)
app.use('/',BlogRouter)


app.listen(process.env.port,()=>{
  connect()
  console.log(`server running at ${process.env.port}`);
  
})