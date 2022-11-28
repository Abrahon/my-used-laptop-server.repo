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


function verifyJWT(req, res, next){
    console.log('token inside verify',req.headers.authorization);
    const autHeader = req.headers.authorization;
    if(!authorization){
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split('')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status.send(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })


}

async function run() {
    try {
        const productsCollection = client.db('UsedLaptop').collection('products');
        const bookingsCollection = client.db('UsedLaptop').collection('bookings');
        const usersCollection = client.db('UsedLaptop').collection('users');


        app.get('/category', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            // const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();
            // products.forEach
            res.send(products);

        });

        app.get('/category/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const products = await productsCollection.findOne(query)
            console.log(products)
            res.send(products)
        });
        app.get('/bookings',verifyJWT, async(req, res)=>{
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'});

            }
            const query = {email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })
        app.post('/bookings', async(req, res)=>{
            const booking = req.body;
            console.log(booking);
            const query = {
                email:booking.email,
                product:booking.product
            }

            const alreadyBooked = await bookingsCollection.find(query).toArray();

            if(alreadyBooked.length){
                const message = `You already have a booking on ${booking}`
                return res.send({acknowledged: false, message})
            }

            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });

        
        app.get('/jwt', async(req,res)=>{
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email},process.env.ACCESS_TOKEN, {expiresIn:'2h'})
                return res.send({accessToken: token});
            }
            console.log(user)
            res.status(403).send({accessToken:''})

        })
        app.post('/users', async(req, res)=>{
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })


        // app.post('/users', async(req,res)=>{
        //     const user = req.body;
        //     const result = await usersCollection.insertOne(user);

        //     res.send(result);

        // })





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