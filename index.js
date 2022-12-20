const express = require('express');
const app=express()
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port=process.env.PORT || 5000;

// middlewares
app.use(cors())
app.use(express.json())


app.get('/', (req, res)=>{
    res.send('server is running')
})

app.listen(port, (req, res)=>{
    console.log('listening to port', port);
})


// mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u5tj5cw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const serviceCollection=client.db('Rooftop-doctor').collection('services')

        // read limited services for home page
        app.get('/services', async(req, res)=>{
            const querry={}
            const cursor=serviceCollection.find(querry)
            const services=await cursor.limit(3).toArray()
            res.send(services)
        })
        // read all services for services page
        app.get('/allservices', async(req, res)=>{
            const querry={}
            const cursor=serviceCollection.find(querry)
            const services=await cursor.toArray()
            res.send(services)
        })
        // read one service by id
        app.get('/services/:id', async(req, res)=>{
            const id=req.params.id
            const querry={_id:ObjectId(id)}
            const service=await serviceCollection.findOne(querry)
            res.send(service)
        })
    }
    finally{

    }
}
run().catch(err=>console.log(err))


