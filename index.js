const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

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

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.xu5udz0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   }
});

async function run() {
   try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();

      //==============================================================Collections//
      const galleryCollection = client.db('toy_racer').collection('gallery');

      //==============================================================gallery route
      app.get('/gallery', async (req, res) => {
         const result = await galleryCollection.find().toArray();
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
})

