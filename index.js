const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dineware.web.app",
      "https://dineware.firebaseapp.com",
      "https://dineware.surge.sh",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).send({ message: "unauthorized access" });
  }

  // verify
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;

    next();
  });
};

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// const uri = "mongodb://localhost:27017/";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t08r2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

  // auth related API
  app.post("/jwt", (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.SECRET_KEY, {
      expiresIn: "6h",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .send({ success: true });
  });

  app.post("/logout", (req, res) => {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .send({ success: true });
  });

  // food related API
  // get all foods + search, sort, filter
  app.get("/foods", async (req, res) => {
    const filter = req.query.filter || null;
    const search = req.query.search || "";
    const sort = req.query.sort || null;

    // Validate sort and filter
    const validSortValues = ["asc", "dsc"];
    if (sort && !validSortValues.includes(sort)) {
      return res.status(400).send({ error: "Invalid sort value." });
    }

    // Build query
    let query = {};
    if (search) {
      query.foodName = { $regex: search, $options: "i" };
    }
    if (filter) {
      query.foodOrigin = filter;
    }

    // Sorting options
    const options = sort ? { sort: { price: sort === "asc" ? 1 : -1 } } : {};

    try {
      const result = await foodsCollection.find(query, options).toArray();
      if (result.length === 0) {
        return res
          .status(200)
          .send({ message: "No food items found.", data: [] });
      }
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Failed to fetch food items." });
    }
  });

  app.get("/foods/top-selling", async (req, res) => {
    const result = await foodsCollection
      .find()
      .sort({ purchase_count: -1 })
      .limit(6)
      .toArray();
    res.send(result);
  });

  // get food details by id
  app.get("/food/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await foodsCollection.findOne(query);
    res.send(result);
  });

  // add food to db
  app.post("/add-food", verifyToken, async (req, res) => {
    const foodData = req.body;
    const result = await foodsCollection.insertOne(foodData);
    res.send(result);
  });

  // get foods by email for my foods page
  app.get("/foods/:email", verifyToken, async (req, res) => {
    const user_email = req.params.email;
    const decoded_email = req.user?.email;

    // token_email !== query/params email
    if (decoded_email !== user_email) {
      return res.status(403).send({ message: "forbidden access" });
    }

    const query = { email: user_email };
    const result = await foodsCollection.find(query).toArray();
    res.send(result);
  });

  // food data update api
  app.put("/food/update/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    const foodData = req.body;

    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: foodData,
    };
    const options = { upsert: true };

    const result = await foodsCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
  });

  // order related API
  // save an order in order_db
  app.post("/orders", verifyToken, async (req, res) => {
    const order_data = req.body;
    const result = await ordersCollection.insertOne(order_data);
    res.send(result);
  });

  // get logged in users order data
  app.get("/orders/:email", verifyToken, async (req, res) => {
    const user_email = req.params.email;
    const decoded_email = req.user?.email;

    // token_email !== query/params email
    if (decoded_email !== user_email) {
      return res.status(403).send({ message: "forbidden access" });
    }

    const query = { buyerEmail: user_email };
    const result = await ordersCollection.find(query).toArray();
    res.send(result);
  });

  app.delete("/orders/delete/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await ordersCollection.deleteOne(query);
    res.send(result);
  });

  // Send a ping to confirm a successful connection
  // await client.db("admin").command({ ping: 1 });
  // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
