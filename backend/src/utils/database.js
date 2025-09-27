const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('MONGODB_URI from env:', process.env.MONGODB_URI ? 'Loaded' : 'UNDEFINED');
        console.log('NODE_ENV:', process.env.NODE_ENV);

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;