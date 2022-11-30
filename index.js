const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt  = require('jsonwebtoken');

const { query } = require('express');
const { Await } = require('react-router-dom');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


//middle wares
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rw41wea.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next){
    console.log('token inside verify', req.headers.authorization);
    const autHeader = req.headers.authorization;
    if(!autHeader){
        return res.status(401).send({message: 'forbidden access'});
    }

    const token =autHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})

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
        const laptopsCollection = client.db('UsedLaptop').collection('laptops');

        const verifyAdmin = async(req, res, next)=>{
            // console.log('inside verifyAdmin', req.decoded.email);
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query);

            if(user?.role !== 'admin'){
                
                return res.status(403).send({message: 'forbidden access'})
            }
            next();


        }
        // app.get('/v2/appointmentOptions', async (req, res) => {
        //     const date = req.query.date;
        //     const options = await appointmentOptionCollection.aggregate([
        //         {
        //             $lookup: {
        //                 from: 'bookings',
        //                 localField: 'name',
        //                 foreignField: 'treatment',
        //                 pipeline: [
        //                     {
        //                         $match: {
        //                             $expr: {
        //                                 $eq: ['$appointmentDate', date]
        //                             }
        //                         }
        //                     }
        //                 ],
        //                 as: 'booked'
        //             }
        //         },
        //         {
        //             $project: {
        //                 name: 1,
        //                 price: 1, 
        //                 slots: 1,
        //                 booked: {
        //                     $map: {
        //                         input: '$booked',
        //                         as: 'book',
        //                         in: '$$book.slot'
        //                     }
        //                 }
        //             }
        //         },
        //         {
        //             $project: {
        //                 name: 1,
        //                 price: 1,
        //                 slots: {
        //                     $setDifference: ['$slots', '$booked']
        //                 }
        //             }
        //         }
        //     ]).toArray();
        //     res.send(options);
        // })


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

        app.get('/productQuality', async(req, res)=>{
            const query = {}
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        });


        app.get('/bookings',verifyJWT, async(req, res)=>{
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'});

            }
            const query = {email: email};
            const bookings = await bookingsCollection.find(query).toArray()
            res.send(bookings);
        });
        app.post('/bookings', async(req, res)=>{
            const booking = req.body;
            console.log(booking);
           
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });

        
        app.get('/jwt', async(req,res)=>{
            const email = req.query.email;
            console.log('jwt',email)
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email},process.env.ACCESS_TOKEN ,{expiresIn:'333h'})
                return res.send({accessToken: token});
            }
            
            res.status(403).send({accessToken:''})

        });
        app.get('/users', async(req, res) =>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/users/buyer',async(req,res)=>{
            const query = {role:"buyer"};
            const users = await usersCollection.find(query).toArray();
            res.send(users)

        })

        app.get('/users/seller',async(req,res)=>{
            const query = {role:"seller"};
            const users = await usersCollection.find(query).toArray();
            res.send(users)

        });
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })

        app.get('/users/admin/:email', async (req,res)=>{
            const email = req.params.email; 
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});
 
         });

        app.post('/users', async(req, res)=>{
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.get('users', async(req,res)=>{


        })

        app.put('/users/admin/:id', verifyJWT, async(req, res) =>{
            const id = req.params.id;
            const filter = {_id:ObjectId(id) }
            const options = {upsert: true};
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        app.put('/addPrice', async(req, res)=>{
            const filter = {}
            const options = {upsert:true}
            const updatedDoc = {
                $set: {
                    price: '99'
                }
            }
            const result = await productsCollection.updateMany(filter, updatedDoc,options)
            res.send(result);
        })
        app.get('/laptops', verifyJWT, async(req,res)=>{
            const query = {};
            const laptops = await laptopsCollection.find(query).toArray();
            res.send(laptops)
        })
        app.post('/laptops', verifyJWT, async(req,res)=>{
            const laptop =req.body;
            const result = await laptopsCollection.insertOne(laptop);
            res.send(result);
        });

        app.delete('/laptops/:id', verifyJWT, async(req,res)=>{
            const id = req.params.id;
            const filter = {_id:ObjectId(id)}
            const result = await laptopsCollection.deleteOne(filter);
            res.send(result);

        });
        

        

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
// app.get('/users/admin/:email', async (req, res) => {
//     const email = req.params.email
//     const query = { email };
//     const user = await usersCollection.findOne(query)
//     res.send({ isAdmin: user?.role === 'admin' })
// })

app.get('/users/seller/:email', async (req, res) => {
    const email = req.params.email
    const query = { email };
    const user = await usersCollection.findOne(query)
    res.send({ isSeller: user?.role === 'seller' })
})