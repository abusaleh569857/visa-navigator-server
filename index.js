// const express = require('express');
// const cors = require('cors');
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const app = express();
// require('dotenv').config();

// const port = process.env.PORT || 5000;

// //middleware 

// app.use(express.json());
// app.use(cors());


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.otdu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// console.log(uri);

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     const visaCollection = client.db("visaNavigatorDB").collection("visaNavigator");
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");

   
//     app.post('/visa', async(req,res) => {
//       const addNewVisa = req.body;
//       console.log(addNewVisa);
//       const result = await visaCollection.insertOne(addNewVisa);
//       res.send(result);

//      })
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

// app.get('/', ((req,res) => {
//     res.send("Server is Running!");
// }))

// app.listen(port,() => {
//     console.log(`Server is Running at port: ${port}`);
// })

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.otdu5.mongodb.net/?retryWrites=true&w=majority`;
console.log("MongoDB URI:", uri);

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect to MongoDB once
    await client.connect();
    console.log("Connected to MongoDB successfully!");

    // Collections
    const visaCollection = client.db("visaNavigatorDB").collection("visaNavigator");

    app.get('/visa', async (req, res) => {
        const visas = await visaCollection.find().toArray();
        res.send(visas);
      });
      

    // POST API to add a new visa
    app.post("/visa", async (req, res) => {
      try {
        const addNewVisa = req.body;
        console.log("New Visa Data Received:", addNewVisa);

        const result = await visaCollection.insertOne(addNewVisa);
        res.send(result);
      } catch (error) {
        console.error("Error adding new visa:", error.message);
        res.status(500).send({ error: "Failed to add visa." });
      }
    });

    // Root route
    app.get("/", (req, res) => {
      res.send("Visa Navigator Server is Running!");
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
