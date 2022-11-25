const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app =express();
const port = process.env.PORT || 5000;


//middle wares
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rw41wea.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
   try{
    const productsCollection = client.db('UsedLaptop').collection('products');

   }
   finally{

   }

}

run().catch(err => console.error(err))

app.get('/', (req, res) =>{
    res.send('products api is running')
})

app.listen(port, ()=>{
    console.log(`Products sever running on ${port}`)
})