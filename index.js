const express = require('express');
const cors = require('cors');
const jwt=require('jsonwebtoken')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h6n6sed.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWt(req, res , next){
          const authHeader=req.headers.authorization;  
          
          if(!authHeader){
              return res.status(401).send({message:"UNAUTHORIZED Access"})
          }
          const token=authHeader.split(" ")[1]
          jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
              if(err){
                 return res.status(403).send({message:"ForBidden Access"}) 
              }
              req.decoded = decoded;
              next();
          });

}

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('bioji-metal').collection('products');
        const ordersCollection = client.db('bioji-metal').collection('orders');
        const userCollection = client.db('bioji-metal').collection('users');

        // all products data load
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // single products data load 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        });

        // app.delete('/products/:id',async , (req, res)=>{
        //     const id =req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await productsCollection.deleteOne(query);
        //     res.send(result);
        // })

        // app.put('/products/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const updateData = req.body;
        //     const filter = {_id: ObjectId(id)}
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: updateData,
        //     };
        //     const result = await productsCollection.updateOne(filter, updateDoc, options);
        //     const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        //     res.send({result, token});
   // });

        //post single data

        app.post("/orders", async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        });

        //order single data load
        app.get('/orders', verifyJWt, async (req, res) => {
            const buyerEmail = req.query.buyerEmail;
            const decodedEmail=req.decoded.email;
            if(buyerEmail===decodedEmail){
                const query = {buyerEmail:buyerEmail};
                const orders = await ordersCollection.find(query).toArray();
                res.send(orders);
            }

            else{
                return res.status(403).send({message:'Forbidden Access'})
            }
            
        });


        //add & update user
        app.put('/user/:email', async (req, res) => {
            const user = req.body;
            const email = req.params.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({result, token});
    });


    app.get('/allusers', verifyJWt, async (req, res) => {
        const query = {};
        const cursor = userCollection.find(query);
        const users = await cursor.toArray();
        res.send(users);
    });

    
  //make admin

    app.put('/user/admin/:email', verifyJWt, async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const requester = req.decoded.email;
        const requesterAccount = await user-+Collection.findOne({ email: requester });
        if (requesterAccount.role === 'admin') {
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        }
        else {
            res.status(403).send({ message: '403 - Forbidden access' });
        }
    });

    app.get('/admin/:email', async (req, res) => {
        const email = req.params.email;
        const user = await userCollection.findOne({ email: email });
        const isAdmin = user.role === 'admin';
        res.send({ admin: isAdmin });
    });

 //add new products
    app.post("/products", async (req, res) => {
        const newProduct = req.body;
        const result = await partsCollection.insertOne(newProduct);
        res.send(result);
    });

        


    }
    finally {

    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Bioji Metal')
})

app.listen(port, () => {
    console.log("listen on port" , port);
})