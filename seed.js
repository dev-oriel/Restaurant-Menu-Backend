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
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAdpreMEerKOC4q4dijPULNPTKmYcdREaPkf5Of2B33wfq5Ty-m8v_NGUxOHpaH366yrL6cvo1NzVRFherDm3Lz7dbg64X1PgmAcCycKIvNwvKoEnnfGoEId0Jqcauiq16bUnvAssmKDydBR5zi1poh40nCELDzG1rP_aYMtHkJ1XGqy7qRxyL7oF5QAPt2mEOjLXcKSDxqBG__Ryt9UQzYTJH-kaJg9MpujvQfo0IZLxixcgjSYtcb-_n1c-xZL4bo9iAVPxyHpUg",
        description: "Traditional flame-grilled chicken, smoky and tender.",
        price: 1200,
        category: "Main", // Mapped to a category not present in cards, useful for testing
      },
      {
        name: "Ugali",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC76a4Mu6Mb9bJeGI0Tk-zFDysDmbED28W0hkHl5cmsVjQ9QvpZyykPMtZbb9Z_KFAsnTE6EPuMaVqMATLmYOuUHSiVMMoMMHzm2uOQbWekZTtTbkmyccoBpY6g3ZA-FyfV4XQgrVEPhsy--dO4jTuw7nQBs3izwcpS_lBt8LMRnSB05vpiT1F9AORbxJy2Sc7Oaj0wLXTuPikAsURUn3VcizlUQPQ9ZH6UP3i6YZDBHqT9aC85lyIszVyUFbZOVRMI5bZeRuoUSGs",
        description: "Fine cornmeal staple, perfect for soaking up stew.",
        price: 100,
        category: "Side",
      },
      {
        name: "Beef Samosa",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDMbrm6lO3aVnopMZ_YqeEzYBiA4i9NLR8FDfNHWL18BxyaFGY2s64jiolyv11nd1SNU24_nKQsF7GzQD0XurGB6HJG22l5zoC9N3VzhSU6EGW_eqfq0itFt6LIoY-QmBk9aWFtZYRAqpgAdkbqCesG0yKkWCl_nZaD5m6cZ7HyB9PHNtmo5YQDeva9Vra2CwQ9K_sS_Wd7yuuOtzb1bihTv0_disxEsaR08-XkMpz9BnCRC-FyZFm07H0BKB7j0Y376sKebUkgV0o",
        description: "Crispy fried pastry filled with spiced ground beef.",
        price: 150,
        category: "Appetizers", // Mapped to a card category
      },
      {
        name: "Meat Pie",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAGMezzv0ZxAetIi6Rw5LlySWRgjxvkreu5eClmQI-5Vmjm1MOI1_H6ekNR0XzJ4Z0dfw795Pl7gQr31tGoNzuHKTQ3RevOq3VLHmQBLO--QZc5rTpCnw6N3PuCYom8WC8UR2reZQTZDhYcXJVImPaV72lHLGtTIDZg_axCw9R3dNh79vR6EF1Na2rGCg0VGYPmvHKNGw9lG6MrZB0o7D6eVp2l4Ce5YygUxW5eweQFpUHoDZlvkw3VcjrDm6j0Pfvn9xa0w1pG6S4",
        description: "A freshly baked Nigerian meat pie with a golden crust.",
        price: 550,
        category: "Appetizers",
      },
      {
        name: "Puff Puff",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAnDT4O9waafv-BNobnnBs5Us1eA9OQ-FuN5rOvPRlUVk3sWVBSL1ttPcUO6qR7K-d8EjIcLDzV5li0AKtZKjug2tPqaKyrbdRvzRENKwgAt_h9XUp12jYjT7sXA5rwI_ba8yyeZjXINjYhYq5d49xwtJKTOjeo_qaCW1yfGzigU9Uk9cx_WzCu5PYqHicBdFC_W4SiuR6PROWeQjH4Q0EUq9mno-USUQKNbwZXVElcv8EU8m2eUr6B8MyAKt0yn1l4C1MQwCZAMDE",
        description: "A stack of sweet, fluffy puff puff desserts.",
        price: 600,
        category: "Desserts",
      },
      {
        name: "Mango Passion Smoothie",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCSrJfD2FOx0z3QCjIc2h5L40nnYlfMpmHL05JKjR2w254_JDUigtRUZSHMyMiNEJKbn-ux6Udr2bVNo8BStMmdLnG-IV18jVtaVV5EzAcEe0L8jA0f_kAQHo8fZZJHtTbg3cc0UFyrhIFbFIiZNnH7k-eslWWTy3vOTZ8HRCVsJfO6NpjqIylhGcppTIT_uXcqp4PtWbxwb7UdqOzwXbEA4skn3OeasdeD-DV0QHtZYNvT6y4Szhb2AjkTFzKJ7-VyubIDmdAaYDc", // Reusing the drinks picture for testing
        description: "Fresh tropical mango and passion fruit blend.",
        price: 300,
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
