const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt  = require('jsonwebtoken');

const { query } = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


//middle wares
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rw41wea.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const productsCollection = client.db('UsedLaptop').collection('products');
        const bookingsCollection = client.db('UsedLaptop').collection('bookings');


        app.get('/category', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);

        });

        app.get('/category/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const products = await productsCollection.findOne(query)
            console.log(products)
            res.send(products)
        });
        app.post('/bookings', async(red, res)=>{
            const booking = req.body;
            console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })


        app.get('/jwt', async(req,res)=>{
            const email = req.query.email;
            const query = {email: email};
            const user = await userCollection.findOne(query);
            if(user){
                const token = jwt.sign({email},process.env.ACCESS_TOKEN, {expiresIn:'2h'})
                return res.send({accessToken: token});
            }
            console.log(user)
            res.status(403).send({accessToken:''})

        })
        app.post('/user', async(req, res)=>{
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        })



    }
    finally {

    }

}

run().catch(err => console.error(err))

app.get('/', (req, res) => {
    res.send('products api is running')
})

app.listen(port, () => {
    console.log(`Products sever running on ${port}`)
})