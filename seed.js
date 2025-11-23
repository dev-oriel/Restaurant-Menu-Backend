require("dotenv").config();
const mongoose = require("mongoose");
const MenuItem = require("./models/MenuItem");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Seeding Database...");
    await MenuItem.deleteMany({});

    await MenuItem.insertMany([
      {
        name: "Chicken Biryani",
        price: 650,
        category: "Mains",
        image:
          "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80",
      },
      {
        name: "Beef Burger",
        price: 850,
        category: "Mains",
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
      },
      {
        name: "Masala Chips",
        price: 250,
        category: "Sides",
        image:
          "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500&q=80",
      },
      {
        name: "Passion Juice",
        price: 200,
        category: "Drinks",
        image:
          "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500&q=80",
      },
    ]);

    console.log("Database Seeded Successfully");
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
