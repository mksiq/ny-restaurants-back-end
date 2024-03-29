/**********************************************************************************************
 *   WEB422 – Assignment 1
 *
 *   I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 *   No part of this assignment has been copied manually or electronically from any other source
 *   (including web sites) or distributed to other students.
 *
 *   Name: Maickel Siqueira Student ID: 129337192 Date: 2020-01-17
 *   Heroku Link: https://web422-assignment1-msiqueira.herokuapp.com/api/restaurants/
 *
 ***********************************************************************************************/

/** I am using import modules instead of requires */
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import RestaurantDB from "./modules/restaurantDB.js";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config({ path: "./config/keys.env" });

const db = new RestaurantDB(process.env.MONGO_DB);

const HTTP_PORT = process.env.PORT || 8080;

(async () => {
  try {
    await db.initialize();
    app.listen(HTTP_PORT, () => {
      console.log(`Serving on ${HTTP_PORT}`);
      if (HTTP_PORT === 8080) {
        console.log("Click here to open browser: http://localhost:8080");
      }
    });
  } catch (err) {
    console.error(err);
  }
})();

/**
   GET to test the API
 */
app.get("/", (req, res) => {
  res.status(200).json({ message: "API Listening." });
});

/** Search restaurant by id. Example:
  GET http://localhost:8080/api/restaurants/5eb3d668b31de5d588f4292e
*/
app.get("/api/restaurants/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await db.getRestaurantById(id);
    if (!restaurant) {
      res
        .status(407)
        .json({ message: `Unable to find restaurant with id as : ${id}` });
    } else {
      res.status(200).json(restaurant);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong in the database." });
  }
});

/** Search restaurants by page, num of pages and borough. Example: 
  GET http://localhost:8080//api/restaurants?page=1&perPage=5&borough=Bronx
*/
app.get("/api/restaurants/", async (req, res) => {
  const { page, perPage, borough } = req.query;
  try {
    const restaurants = await db.getAllRestaurants(page, perPage, borough);
    if (!restaurants || !Array.isArray(restaurants) || !restaurants.length) {
      res.status(407).json({ message: "Query didn't find any restaurant." });
    } else {
      res.status(200).json(restaurants);
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

/** Inserts a new restaurant to the database
 * Ex : POST /api/restaurants with body:
 "data": {"address":{"coord":[43.7951911,-79.3497124],
    "building":"2300",
    "street":"1750 Finch Ave E","zipcode":"M2J2X5"},
    "borough":"North York",
    "cuisine":"Canadian",
    "grades":[{"date":"2014-05-28T00:00:00.000Z","grade":"A","score":11},{"date":"2013-06-19T00:00:00.000Z","grade":"A","score":4},{"date":"2012-06-15T00:00:00.000Z","grade":"A","score":3}],
    "name":"Starbucks","restaurant_id":"01"}
 * Id created with example : 60046df94912e61f5b484cbb 
 */
app.post("/api/restaurants/", async (req, res) => {
  const { data } = req.body;
  if (data) {
    try {
      const response = await db.addNewRestaurant(data);
      if (!response) {
        res.status(500).json({ message: "Something went wrong" });
      } else {
        res.status(200).json({ message: response });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(400).json({ message: "No restaurant information given." });
  }
});

/** Updates an existing restaurant in the database, expects body with json 
 * and param with id. Example : 
  PUT http://localhost:8080/api/restaurants/60046df94912e61f5b484cbb 
  Content-Type: application/json
  {
  "data": {
      "address":{"coord":[43.7951911,-79.3497124],
      "building":"888",
      "street":"1750 Finch Ave E","zipcode":"M2J2X5"},
      "borough":"North York",
      "cuisine":"Canadian",
      "grades":[{"date":"2020-01-17T00:00:00.000Z","grade":"A","score":10}],
      "name":"UPDATED Starbucks","restaurant_id":"01"
    }
  }
*/
app.put("/api/restaurants/:id", async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  if (data && id) {
    try {
      // Makes sure that the restaurant exists
      const restaurant = await db.getRestaurantById(id);
      if (!restaurant) {
        res
          .status(407)
          .json({ message: `Unable to find restaurant with id as : ${id}` });
      } else {
        try {
          // This is where it actually updates
          const response = await db.updateRestaurantById(data, id);
          if (!response) {
            res.status(500).json({ message: "Something went wrong" });
          } else {
            res.status(200).json({ message: response });
          }
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Something went wrong in the database." });
    }
  } else {
    res
      .status(400)
      .json({ message: "Not enough restaurant information given." });
  }
});

/** Delete one restaurant by id. Example:
  GET http://localhost:8080/api/restaurants/60046df94912e61f5b484cbb 
*/
app.delete("/api/restaurants/:id", async (req, res) => {
  const { id } = req.params;
  if (id) {
    try {
      const response = await db.deleteRestaurantById(id);
      if (!response) {
        res.status(500).json({ message: "Something went wrong" });
      } else {
        res.status(204).json({ message: response });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(400).json({ message: "Id not provided." });
  }
});