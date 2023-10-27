const User = require("../models/user");
const Stock = require("../models/stock");
const axios = require("axios");

const getAlphaVantageUrl = (ticker) =>
  `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&month=2023-10&outputsize=full&apikey=${process.env.ALPHA_VANTAGE_KEY}`;

const getUser = (req, res) => {
  const userId = req.params.id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const tickers = user.stocks.map((stock) => stock.ticker);
      Stock.find({ ticker: { $in: tickers } })
        .then((stocks) => {
          const userStocks = stocks.map((stock) => ({
            ticker: stock.ticker,
            price: stock.price,
            amount: stock.amount,
          }));
          const payload = { username: user.username, stocks: userStocks };
          return res.status(200).json({ user: payload });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ message: "Internal server error" });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Internal server error" });
    });
};

const addStock = (req, res) => {
  const ticker = req.body.ticker;

  // check if stock already exists
  Stock.findOne({ ticker })
    .then(async (stock) => {
      let price;
      if (!stock || stock.lastUpdated <= new Date(Date.now() - 8.64e7)) {
        // pull stock from api
        price = await axios.get(getAlphaVantageUrl(ticker)).then((response) => {
          return Object.values(Object.values(response.data)[1])[0]["1. open"];
        });

        if (stock) {
          // update the stock's price
          try {
            stock = await Stock.findOneAndUpdate({ ticker }, { price });
          } catch (err) {
            console.log(err);
            res.status(500).json({
              message: "failed to update the price of stock: " + ticker,
            });
          }
        } else {
          // create a new stock document
          try {
            stock = await Stock.create({
              ticker,
              price,
              lastUpdated: new Date(),
            });
          } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal server error" });
          }
        }
      }

      // add stock to user stock list
      const userId = req.params.id;
      const amount = parseInt(req.body.amount);
      const userStock = { ticker: stock.ticker, amount };
      User.findByIdAndUpdate(userId, { $push: { stocks: userStock } })
        .then((user) => {
          if (!user) {
            return res.status(404).json({ message: "user not found" });
          }
          return res.json({ ticker, amount, price });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ message: "Internal server error" });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Internal server error" });
    });
};

const updateStock = (req, res) => {
  res.send("updateStock works");
};

const removeStock = (req, res) => {
  res.send("removeStock works");
};

module.exports = {
  getUser,
  addStock,
  updateStock,
  removeStock,
};
