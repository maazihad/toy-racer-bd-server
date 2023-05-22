const express = require('express');
const cors = require('cors');
require('dotenv').config();
// const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// =================================================================Create Express 
const app = express();
const port = process.env.PORT || 5555;
// ===============================================================middleware
app.use(cors());
app.use(express.json());

// ===============================================================Starting route
app.get('/', (req, res) => {
   res.send('Toy racer bd is running ................');
});

// ================================================================MongoDB

// const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.xu5udz0.mongodb.net/?retryWrites=true&w=majority`;
const uri = "mongodb://127.0.0.1:27017";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   }
});
// =====================================================================Verify Jot
// const verifyJWT = (req, res, next) => {
//    const authorization = req.headers.authorization;
//    if (!authorization) {
//       return res.status(401).send({ error: true, message: "unauthorized access" });
//    }
//    const token = authorization.split(' ')[1];
//    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
//       if (error) {
//          return res.status(401).send({ error: true, message: "unauthorized access." });
//       }
//       req.decoded = decoded;
//       next();
//    });
// };

async function run() {
   try {
      // Connect the client to the server	(optional starting in v4.7)
      // await client.connect();

      //==============================================================Collections//
      const galleryCollections = client.db('toy_racer').collection('galleries');
      const addAToyCollections = client.db('toy_racer').collection('myToys');
      const allToys = client.db('toy_racer').collection('allToys');
      // =============================================================Post :JWT
      // app.post('/jwt', (req, res) => {
      //    const user = req.body;
      //    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
      //    res.send({ token });
      // });


      //==============================================
      const indexKeys = { toyName: 1 };
      const indexOptions = { name: "toyName" };
      const result = await allToys.createIndex(indexKeys, indexOptions);
      // console.log(result);
      // console.log(
      //    "Pinged your deployment. You successfully connected to MongoDB!"
      // );
      //============================================================get :gallery route
      app.get('/galleries', async (req, res) => {
         const result = await galleryCollections.find({}).toArray();
         res.send(result);
      });


      // ==========================================================GET : all toys route
      app.get('/allToys', async (req, res) => {
         const result = await allToys.find({}).toArray();
         res.send(result);
      });

      // ============================================================Get : single toys route
      app.get('/allToys/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const options = {
            projection: {
               picture: 1,
               name: 1,
               price: 1,
               sellerName: 1,
               sellerEmail: 1,
               rating: 1,
               availableQuantity: 1,
               details: 1,
            },
         };
         const toys = await allToys.findOne(query, options);
         res.send(toys);
         console.log(toys);
      });



      // ==========================================================Search Implement
      app.get("/searchByToyName/:text", async (req, res) => {
         const searchText = req.params.text;
         const result = await allToys.find({
            $or: [
               { toyName: { $regex: searchText, $options: "i" } }
            ],
         }).toArray();
         res.send(result);
      });


      // ===========================================================GET : My toys route
      // app.get('/myToys', verifyJWT, async (req, res) => {
      //    const decoded = req.decoded;
      //    if (decoded.email !== req.query.email) {
      //       return res.status(403).send({ error: 1, message: "Access denied" });
      //    }
      //    let query = {};
      //    if (req.query?.email) {
      //       query = { email: req.query.email };
      //    };
      //    const result = await addAToyCollections.find(query).toArray();
      //    res.send(result);
      //    // console.log(result);
      // });


      // another way =============================================get : my toys route
      app.get("/myToys/:email", async (req, res) => {
         const sellerEmail = {
            email: req.params.email
         };
         const toys = await addAToyCollections.find(sellerEmail).toArray();
         res.send(toys);
         console.log(toys);
      });


      // ===========================================================Post: My Toys route
      app.post('/myToys', async (req, res) => {
         const addAToy = req.body;
         const result = await addAToyCollections.insertOne(addAToy);
         res.send(result);
         // console.log(result);
      });

      //=============================================================Put : Update route
      app.put('/myToys/:id', async (req, res) => {
         const id = req.params.id;
         const body = req.body;
         const filter = {
            _id: new ObjectId(id)
         };
         // const options = {
         //    upsert: true
         // };
         const updateToys = {
            $set: {
               price: body.price,
               quantity: body.quantity,
               details: body.details
            }
         };
         const result = await addAToyCollections.updateOne(filter, updateToys);
         console.log(result);
         res.send(result);
      });

      //==============================================================Delete : MyToy route

      app.delete('/myToys/:id', async (req, res) => {
         const id = req.params.id;
         const query = {
            _id: new ObjectId(id)
         };
         const result = await addAToyCollections.deleteOne(query);
         console.log(result);
         res.send(result);
      });


      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
   }
}
run().catch(console.dir);

//================================================================Listen
app.listen(port, () => {
   console.log(`Toy racer bd is running on port : ${port}`);
});


// =============================================================export API
module.exports = app;