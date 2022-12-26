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
        const reviewCollection=client.db('Rooftop-doctor').collection('reviews')

        // read limited services for home page
        app.get('/services', async(req, res)=>{
            const querry={}
            const cursor=serviceCollection.find(querry)
            const services=await cursor.sort({ $natural: -1 }).limit(3).toArray()
            res.send(services)
        })
        // read all services for services page
        app.get('/allservices', async(req, res)=>{
            const querry={}
            const cursor=serviceCollection.find(querry)
            const services=await cursor.toArray()
            res.send(services)
        })
        // read one service by id for service detail page
        app.get('/services/:id', async(req, res)=>{
            const id=req.params.id
            const querry={_id:ObjectId(id)}
            const service=await serviceCollection.findOne(querry)
            res.send(service)
        })
         // post service
         app.post('/service' , async(req, res)=>{
            const service=req.body
            const result=await serviceCollection.insertOne(service)
            res.send(service)
        })
        // update rating of service 
        app.put('/services/:id',async(req, res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const data=req.body
            const option={upsert:true}
            const updatedRating={
                $set:{
                  ratings:data.serviceRating
                }
            }
            const result=await serviceCollection.updateOne(query, updatedRating, option)
            res.send(result)
        })
        // post review
        app.post('/reviews' , async(req, res)=>{
            const reviews=req.body
            const result=await reviewCollection.insertOne(reviews)
            res.send(reviews)
        })
        // read reviews
        app.get('/reviews', async(req, res)=>{
            let query={}
            // filter by service name for service detail page
            if (req.query.name) {
                query={
                    serviceName:req.query.name
                }
            }
            // filter by user email for my reviews  page

            if (req.query.email) {
                query={
                    userEmail:req.query.email
                }
            }
            const cursor=reviewCollection.find(query)
            const reviews=await cursor.toArray()
                res.send(reviews)
        })
        // update review 
        app.put('/reviews/:id',async(req, res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const user=req.body
            const option={upsert:true}
            const updatedReview={
                $set:{
                   userReview:user.review
                }
            }
            const result=await reviewCollection.updateOne(query, updatedReview, option)
            res.send(result)
        })
        // delete review
        app.delete('/reviews/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const result=await reviewCollection.deleteOne(query)
            res.send(result)
        })
       
    }
    finally{

    }
}
run().catch(err=>console.log(err))


