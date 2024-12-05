const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const visaCollection = client
      .db("visaNavigatorDB")
      .collection("visaNavigator");
    const applicationCollection = client
      .db("visaApplicantDB")
      .collection("applications");
    const usersCollection = client.db("userDB").collection("user");

    app.get("/visa", async (req, res) => {
      const visas = await visaCollection.find().toArray();
      res.send(visas);
    });

    app.get("/visa/:id", async (req, res) => {
      const { id } = req.params;
      const visa = await visaCollection.findOne({ _id: new ObjectId(id) });
      res.send(visa);
    });

    app.get("/applications", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ error: "Email is required" });
      }
      const applications = await applicationCollection
        .find({ email })
        .toArray();
      res.send(applications);
    });

    app.get("/visas", async (req, res) => {
      const email = req.query.email;
      const visas = await visaCollection.find({ addedBy: email }).toArray();
      res.send(visas);
    });

    app.get("/latest-visas", async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 6;

        // Fetch the latest visas from the collection, sorted by _id (descending order)
        const visas = await visaCollection
          .find()
          .sort({ _id: -1 }) // Sorting by _id in descending order (newest first)
          .limit(limit) // Limiting to 6 visas
          .toArray(); // Convert cursor to array

        res.status(200).send(visas);
      } catch (error) {
        console.error("Error fetching visas:", error.message);
        res.status(500).send({ error: "Failed to fetch visas" });
      }
    });

    app.delete("/applications/:id", async (req, res) => {
      const id = req.params.id;
      const result = await applicationCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.delete("/visa/:id", async (req, res) => {
      const id = req.params.id;
      const result = await visaCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/applications", async (req, res) => {
      const applicationData = req.body;
      const result = await applicationCollection.insertOne(applicationData);
      res.send(result);
    });

    // Save user to MongoDB

    app.post("/users", async (req, res) => {
      const user = req.body;
      try {
        const result = await usersCollection.insertOne(user);
        res.send({ insertedId: result.insertedId });
      } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send({ message: "Failed to save user" });
      }
    });

    app.put("/visa/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await visaCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
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
