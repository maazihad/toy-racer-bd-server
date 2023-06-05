const express = require('express');
const cors = require('cors');
require('dotenv').config();
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
// ================================================================MongoDB URI
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.xu5udz0.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb://127.0.0.1:27017";

// ========Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   }
});
async function run() {
   // ====================Connect the client to the server	(optional starting in v4.7)

   //==============================================================Collections//
   const galleryCollections = client.db('toy_racer').collection('galleries');
   const addAToyCollections = client.db('toy_racer').collection('addToy');
   const allOfToys = client.db('toy_racer').collection('allToys');
   const topRelatedToys = client.db('toy_racer').collection('topRelatedProducts');
   const toyCollections = client.db('toy_racer').collection('toys');
   //=============================================================Indexing : for search
   // const indexKeys = { toyName: 1 };
   // const indexOptions = { name: "toyName" };
   // const result = await allOfToys.createIndex(indexKeys, indexOptions);
   // console.log(result);

   //============================================================get :gallery route
   app.get('/galleries', async (req, res) => {
      const result = await galleryCollections.find({}).toArray();
      res.send(result);
   });

   // ==========================================================GET : all toys route
   app.get('/allToys', async (req, res) => {
      const result = await allOfToys.find({}).toArray();
      res.send(result);
   });

   // ============================================================Get : single toys route
   app.get('/singleToy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
         projection: {
            picture: 1,
            toyName: 1,
            price: 1,
            sellerName: 1,
            sellerEmail: 1,
            rating: 1,
            availableQuantity: 1,
            details: 1,
         },
      };
      const toys = await allOfToys.findOne(query, options);
      res.send(toys);
      // console.log(toys);
   });

   // ==========================================================Search Implement
   app.get("/searchByToyName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await allOfToys.find({
         $or: [
            { toyName: { $regex: searchText, $options: "i" } }
         ],
      }).toArray();
      res.send(result);
   });

   //  =============================================get : my toys route & sorting
   app.get("/myToys/:email", async (req, res) => {
      const sellerEmail = {
         email: req.params.email
      };
      const toys = await addAToyCollections.find(sellerEmail).sort({ createdAt: -1 }).toArray();
      res.send(toys);
      // console.log(toys);
   });

   //======================================================Get : Shot by Category
   app.get("/shopToys", async (req, res) => {
      const result = await toyCollections.find({}).toArray();
      res.send(result);
   });

   app.get('/toyDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
         projection: {
            picture: 1,
            toyName: 1,
            price: 1,
            category: 1,
            rating: 1,
            details: 1,
         },
      };
      const toy = await toyCollections.findOne(query, options);
      res.send(toy);
   });

   //===========================================================Get : Top Related Toys
   app.get('/topRelatedToys', async (req, res) => {
      const result = await topRelatedToys.find({}).toArray();
      res.send(result);
   });


   // ===========================================================Post: My Toys route
   app.post('/myToys', async (req, res) => {
      const addAToy = req.body;
      addAToy.createdAt = new Date();
      const result = await addAToyCollections.insertOne(addAToy);
      res.send(result);
      // console.log(result);
   });

   //=============================================================Put : Update route
   app.put('/updateToy/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = {
         _id: new ObjectId(id)
      };
      const options = {
         upsert: true
      };
      const updatedToys = {
         $set: {
            price: body.price,
            quantity: body.quantity,
            details: body.details
         }
      };
      const result = await addAToyCollections.updateOne(filter, updatedToys, options);
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
      // console.log(result);
      res.send(result);
   });

   // =============================Send a ping to confirm a successful connection
   await client.db("admin").command({ ping: 1 });
   console.log("Pinged your deployment. You successfully connected to MongoDB!");

}
run().catch(console.dir);

//================================================================Listen
app.listen(port, () => {
   console.log(`Toy racer bd is running on port : ${port}`);
});

// =============================================================export API
module.exports = app;