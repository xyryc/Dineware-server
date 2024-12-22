const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = "mongodb://localhost:27017/";
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t08r2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  //   try {
  // Connect the client to the server	(optional starting in v4.7)
  // await client.connect();

  const foodsCollection = client.db("dineware").collection("foods");
  const ordersCollection = client.db("dineware").collection("orders");

  // food related API
  // food related apis
  app.get("/foods", async (req, res) => {
    const result = await foodsCollection.find().toArray();
    res.send(result);
  });

  // get food details by id
  app.get("/food/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await foodsCollection.findOne(query);
    res.send(result);
  });

  app.post("/add-food", async (req, res) => {
    const foodData = req.body;
    const result = await foodsCollection.insertOne(foodData);
    res.send(result);
  });

  // order related API
  // save an order in order_db
  app.post("/order", async (req, res) => {
    const order_data = req.body;
    const result = await ordersCollection.insertOne(order_data);
    res.send(result);
  });

  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
  //   } finally {
  // Ensures that the client will close when you finish/error
  // await client.close();
  //   }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Dineware server running");
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
