const mongoose = require('mongoose');
const Order = require("./models/order");

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://latikasood1997:GnHLTvzKPOV4SrYB@cluster0.wcwvz.mongodb.net/shopcart?retryWrites=true&w=majority&appName=Cluster0'
  );
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.log('MongoDB connection error:', err);
    throw err;
  }
};
connectDB();

exports.getOrders = async () => {
  try {
    
    const orders = await Order.find()
    
    return {
      statusCode: 200,
      body: JSON.stringify(orders),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch orders.' }),
    };
  }
};