import express from 'express';
import path from 'path';
import cors from 'cors';
import RestaurantDB from './modules/restaurantDB.js';

const app = express();
app.use(express.json());
app.use(cors());
const db = new RestaurantDB("Your MongoDB Connection String Goes Here")

const HTTP_PORT = process.env.port || 8080;

app.get('/', (req, res) => {
  res.status(200).json({message : 'hi there'});
})

app.listen(HTTP_PORT, () => {
  console.log(`Serving on ${HTTP_PORT}`);
  if (HTTP_PORT === 8080) {
    console.log('Click here to open browser: http://localhost:8080');
  }
});
