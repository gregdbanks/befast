const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('hello, we have connection to the database');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

const disconnectDb = async () => {
    await mongoose.disconnect();
};

module.exports = { connectDb, disconnectDb };
