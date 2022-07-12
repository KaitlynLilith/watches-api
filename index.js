// const Joi = require("joi");
require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = process.env.PORT || 3000;
const thumbnails = require("./api/thumbnails.json");
const products = require("./api/products.json");
const faqs = require("./api/faqs.json");
const retailers = require("./api/retailers.json");
const contactUs = require("./api/contactUs.json");
const pageInfo = require("./api/pageInfo.json");
const categories = require("./api/categories.json");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const whitelist = ["http://127.0.0.1", "http://127.0.0.1:3000"];
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

app.use(cors());

const limiter = rateLimit({
  windowMs: 1000,
  max: 100,
});
app.use(limiter);

// Authenticate super user
// function authenticateSuper(key) {
//   if (key === process.env.API_KEY_1) {
//     return true;
//   }
//   return false;
// }

// Authenticate other user
// function authenticateOther(key) {
//   if (key === process.env.API_KEY_1) {
//     return true;
//   }
//   return false;
// }

// Request information
app.get("/", (req, res) => {
  // if (!authenticateOther(req.body.key))
  //   return res.status(401).send("Authentication failed!");
  res.send("Hello World!");
});

app.get("/api/pageInfo", (req, res) => {
  // if (!authenticateOther(req.body.key))
  //   return res.status(401).send("Authentication failed!");
  res.send(pageInfo);
});

app.get("/api/categories", (req, res) => {
  // if (!authenticateOther(req.body.key))
  //   return res.status(401).send("Authentication failed!");
  res.send(categories);
});

app.get("/api/faqs", (req, res) => {
  // if (!authenticateOther(req.body.key))
  //   return res.status(401).send("Authentication failed!");
  res.send(faqs);
});

app.get("/api/retailers", (req, res) => {
  // if (!authenticateOther(req.body.key))
  //   return res.status(401).send("Authentication failed!");
  res.send(retailers.filter((retailer) => retailer.state === "active"));
});

app.get("/api/contactUs", (req, res) => {
  // if (!authenticateOther(req.body.key))
  //   return res.status(401).send("Authentication failed!");
  res.send(contactUs);
});

app.get("/api/thumbnails/:category", (req, res) => {
  // if (!authenticateOther(req.body.key))
  //   return res.status(401).send("Authentication failed!");
  const collection = thumbnails.filter(
    (prod) => prod.category === req.params.category && prod.state === "active"
  );
  res.send(collection);
});

app.get("/api/thumbnails", (req, res) => {
  // if (!authenticateOther(req.body.key))
  //   return res.status(401).send("Authentication failed!");

  if (req.query.id) {
    const thumbnail = thumbnails.find(
      (item) => item.id === +req.query.id && item.state === "active"
    );
    if (!thumbnail) {
      return res.status(404).send("Product not found!");
    }
    return res.send(thumbnail);
  }

  if (req.query.promote === "yes") {
    return res.send(
      thumbnails.filter(
        (item) => (item["promote"] = "yes" && item.state === "active")
      )
    );
  }
  if (req.query.tags) {
    const tags = Array.isArray(req.query.tags)
      ? [...req.query.tags]
      : Array.of(req.query.tags);
    const searchArr = [];
    searchArr.push({
      all: Object.assign(
        thumbnails.filter((item) =>
          tags.every(
            (tag) => item.tags.includes(tag) && item.state === "active"
          )
        )
      ),
    });
    if (tags.length > 1) {
      searchArr.push({
        some: Object.assign(
          thumbnails.filter((item) =>
            tags.some(
              (tag) => item.tags.includes(tag) && item.state === "active"
            )
          )
        ),
      });
      tags.forEach((tag) =>
        searchArr.push({
          [tag]: Object.assign(
            thumbnails.filter(
              (item) => item.tags.includes(tag) && item.state === "active"
            )
          ),
        })
      );
    }
    return res.send(searchArr);
  }

  res.send(thumbnails.filter((item) => item.state === "active"));
});

app.get("/api/products", (req, res) => {
  // if (!authenticateOther(req.body.key))
  //   return res.status(401).send("Authentication failed!");
  if (req.query.state === "delete") {
    return res.send(products.filter((item) => item["state"] === "delete"));
  }
  res.send(products.filter((item) => item.state === "active"));
});

app.get("/api/products/:id", (req, res) => {
  // if (!authenticateOther(req.body.key))
  //   return res.status(401).send("Authentication failed!");
  const product = products.find(
    (prod) => prod.id === +req.params.id && prod.state === "active"
  );
  if (!product) {
    return res.status(404).send("Product not found!");
  }
  res.send(product);
});

// Add information
app.post("/api/products", (req, res) => {
  // if (!authenticateSuper(req.body.key))
  //   return res.status(401).send("Authentication failed!");

  const product = {
    id: products.length + 1,
    name: req.body.name,
    category: req.body.category,
    promote: req.body.promote,
    price: req.body.price,
    sale: req.body.sale,
    images: req.body.images,
    url: `${req.body.url}${products.length + 1}`,
    shortDesc: req.body.shortDesc,
    topInfo: req.body.topInfo,
    longDesc: req.body.lonDesc,
    features: req.body.features,
    techSpecs: req.body.techSpecs,
    movement: req.body.movement,
    movementImg: req.body.movementImg,
    movementAlt: req.body.movementAlt,
    science: req.body.science,
    scienceImg: req.body.scienceImg,
    scienceAlt: req.body.scienceAlt,
    tags: [...req.body.tags, products.length + 1],
    state: req.body.state,
  };
  const thumbnail = {
    id: products.length + 1,
    name: req.body.name,
    category: req.body.category,
    promote: req.body.promote,
    images: req.body.images,
    url: `${req.body.url}${products.length + 1}`,
    shortDesc: req.body.shortDesc,
    topInfo: req.body.topInfo,
    tags: [...req.body.tags, products.length + 1],
    state: req.body.state,
  };
  products.push(product);
  thumbnails.push(thumbnail);
  return res.send(product);
});

// Update Information
app.put("/api/products/:id", (req, res) => {
  // if (!authenticateSuper(req.body.key))
  //   return res.status(401).send("Authentication failed!");

  const productIndex = products.findIndex((prod) => prod.id === +req.params.id);
  if (!productIndex) {
    return res.status(404).send("Product not found!");
  }

  req.body.name
    ? (products[productIndex].name = req.body.name)
    : (products[productIndex].name = products[productIndex].name);

  req.body.category
    ? (products[productIndex].category = req.body.category)
    : (products[productIndex].category = products[productIndex].category);

  req.body.promote
    ? (products[productIndex].promote = req.body.promote)
    : (products[productIndex].promote = products[productIndex].promote);

  req.body.price
    ? (products[productIndex].price = req.body.price)
    : (products[productIndex].price = products[productIndex].price);

  req.body.sale
    ? (products[productIndex].sale = req.body.sale)
    : (products[productIndex].sale = products[productIndex].sale);

  req.body.images
    ? (products[productIndex].images = req.body.images)
    : (products[productIndex].images = products[productIndex].images);

  req.body.url
    ? (products[productIndex].url = req.body.url)
    : (products[productIndex].url = products[productIndex].url);

  req.body.shortDesc
    ? (products[productIndex].shortDesc = req.body.shortDesc)
    : (products[productIndex].shortDesc = products[productIndex].shortDesc);

  req.body.topInfo
    ? (products[productIndex].topInfo = req.body.topInfo)
    : (products[productIndex].topInfo = products[productIndex].topInfo);

  req.body.longDesc
    ? (products[productIndex].longDesc = req.body.lonDesc)
    : (products[productIndex].longDesc = products[productIndex].longDesc);

  req.body.features
    ? (products[productIndex].features = req.body.features)
    : (products[productIndex].features = products[productIndex].features);

  req.body.techSpecs
    ? (products[productIndex].techSpecs = req.body.techSpecs)
    : (products[productIndex].techSpecs = products[productIndex].techSpecs);

  req.body.movement
    ? (products[productIndex].movement = req.body.movement)
    : (products[productIndex].movement = products[productIndex].movement);

  req.body.movementImg
    ? (products[productIndex].movementImg = req.body.movementImg)
    : (products[productIndex].movementImg = products[productIndex].movementImg);

  req.body.movementAlt
    ? (products[productIndex].movementAlt = req.body.movementAlt)
    : (products[productIndex].movementAlt = products[productIndex].movementAlt);

  req.body.science
    ? (products[productIndex].science = req.body.science)
    : (products[productIndex].science = products[productIndex].science);

  req.body.scienceImg
    ? (products[productIndex].scienceImg = req.body.scienceImg)
    : (products[productIndex].scienceImg = products[productIndex].scienceImg);

  req.body.scienceAlt
    ? (products[productIndex].scienceAlt = req.body.scienceAlt)
    : (products[productIndex].scienceAlt = products[productIndex].scienceAlt);

  req.body.tags
    ? (products[productIndex].tags = req.body.tags)
    : (products[productIndex].tags = products[productIndex].tags);

  req.body.state
    ? (products[productIndex].state = req.body.state)
    : (products[productIndex].state = products[productIndex].state);
  ////////////////////////////////////////

  const thumbnailIndex = thumbnails.findIndex(
    (prod) => prod.id === +req.params.id
  );
  if (!thumbnailIndex) {
    return res.status(404).send("Product not found!");
  }
  req.body.name
    ? (thumbnails[thumbnailIndex].name = req.body.name)
    : (thumbnails[thumbnailIndex].name = thumbnails[thumbnailIndex].name);

  req.body.category
    ? (thumbnails[thumbnailIndex].category = req.body.category)
    : (thumbnails[thumbnailIndex].category =
        thumbnails[thumbnailIndex].category);

  req.body.promote
    ? (thumbnails[thumbnailIndex].promote = req.body.promote)
    : (thumbnails[thumbnailIndex].promote = thumbnails[thumbnailIndex].promote);

  req.body.price
    ? (thumbnails[thumbnailIndex].price = req.body.price)
    : (thumbnails[thumbnailIndex].price = thumbnails[thumbnailIndex].price);

  req.body.sale
    ? (thumbnails[thumbnailIndex].sale = req.body.sale)
    : (thumbnails[thumbnailIndex].sale = thumbnails[thumbnailIndex].sale);

  req.body.images
    ? (thumbnails[thumbnailIndex].images = req.body.images)
    : (thumbnails[thumbnailIndex].images = thumbnails[thumbnailIndex].images);

  req.body.url
    ? (thumbnails[thumbnailIndex].url = req.body.url)
    : (thumbnails[thumbnailIndex].url = thumbnails[thumbnailIndex].url);

  req.body.shortDesc
    ? (thumbnails[thumbnailIndex].shortDesc = req.body.shortDesc)
    : (thumbnails[thumbnailIndex].shortDesc =
        thumbnails[thumbnailIndex].shortDesc);

  req.body.tags
    ? (thumbnails[thumbnailIndex].tags = req.body.tags)
    : (thumbnails[thumbnailIndex].tags = thumbnails[thumbnailIndex].tags);

  req.body.state
    ? (thumbnails[thumbnailIndex].state = req.body.state)
    : (thumbnails[thumbnailIndex].state = thumbnails[thumbnailIndex].state);

  return res.send(products[productIndex]);
});

app.listen(port, () => console.log(`Listening on Port ${port}...`));
