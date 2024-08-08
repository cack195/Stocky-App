require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3001;

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
// Add routes, both API and view
app.use(routes);
// console.log(`mongo: ${process.env.REACT_APP_MONGODB_URI}`)

// Connect to the Mongo DB
mongoose.connect(
  process.env.REACT_APP_MONGODB_URI || "mongodb://localhost/stocktracker",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

// Start the API server
app.listen(PORT, function () {
  console.log(`API Server now listening on PORT ${PORT}!`);
});
