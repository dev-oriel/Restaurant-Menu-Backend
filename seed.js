const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Product = require("./models/Product");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();

    const createdUsers = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        isAdmin: true,
      },
    ]);

    await Product.insertMany([
      {
        name: "Kuku Choma",
        image: "https://placehold.co/400",
        description: "Grilled chicken",
        price: 1200,
        category: "Main",
      },
      {
        name: "Ugali",
        image: "https://placehold.co/400",
        description: "Cornmeal staple",
        price: 100,
        category: "Side",
      },
      {
        name: "Sukuma Wiki",
        image: "https://placehold.co/400",
        description: "Collard greens",
        price: 100,
        category: "Side",
      },
      {
        name: "Tusker Lager",
        image: "https://placehold.co/400",
        description: "Cold Beer",
        price: 350,
        category: "Drinks",
      },
    ]);

    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
