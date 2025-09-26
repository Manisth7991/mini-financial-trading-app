require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected for seeding...');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Sample products data
const sampleProducts = [
    {
        name: 'Tata Consultancy Services',
        symbol: 'TCS',
        category: 'stock',
        pricePerUnit: 3420.50,
        peRatio: 28.5,
        marketCap: 12450000000000,
        yearHigh: 4000.00,
        yearLow: 2800.00,
        description: 'Tata Consultancy Services Limited is an Indian multinational information technology services and consulting company.',
        sector: 'Information Technology',
        historicalPrices: generateHistoricalPrices(3420.50, 30),
        isActive: true
    },
    {
        name: 'Reliance Industries',
        symbol: 'RELIANCE',
        category: 'stock',
        pricePerUnit: 2340.25,
        peRatio: 15.2,
        marketCap: 15800000000000,
        yearHigh: 2850.00,
        yearLow: 2000.00,
        description: 'Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai.',
        sector: 'Oil & Gas',
        historicalPrices: generateHistoricalPrices(2340.25, 30),
        isActive: true
    },
    {
        name: 'HDFC Bank',
        symbol: 'HDFCBANK',
        category: 'stock',
        pricePerUnit: 1565.80,
        peRatio: 19.8,
        marketCap: 11200000000000,
        yearHigh: 1700.00,
        yearLow: 1350.00,
        description: 'HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai.',
        sector: 'Banking',
        historicalPrices: generateHistoricalPrices(1565.80, 30),
        isActive: true
    },
    {
        name: 'SBI Bluechip Fund',
        symbol: 'SBIBCF',
        category: 'mutual_fund',
        pricePerUnit: 285.45,
        peRatio: null,
        marketCap: 450000000000,
        yearHigh: 320.00,
        yearLow: 240.00,
        description: 'SBI Bluechip Fund is an open-ended equity scheme investing in large-cap companies.',
        sector: 'Mutual Fund',
        historicalPrices: generateHistoricalPrices(285.45, 30),
        isActive: true
    },
    {
        name: 'Nifty 50 ETF',
        symbol: 'NIFTY50ETF',
        category: 'etf',
        pricePerUnit: 158.90,
        peRatio: 22.1,
        marketCap: 320000000000,
        yearHigh: 180.00,
        yearLow: 135.00,
        description: 'This ETF tracks the performance of the Nifty 50 Index, comprising the top 50 companies by market cap.',
        sector: 'ETF',
        historicalPrices: generateHistoricalPrices(158.90, 30),
        isActive: true
    },
    {
        name: 'ICICI Prudential IT Fund',
        symbol: 'ICICIPITF',
        category: 'mutual_fund',
        pricePerUnit: 425.30,
        peRatio: null,
        marketCap: 180000000000,
        yearHigh: 485.00,
        yearLow: 350.00,
        description: 'ICICI Prudential Technology Fund is a sectoral fund focused on technology companies.',
        sector: 'Mutual Fund',
        historicalPrices: generateHistoricalPrices(425.30, 30),
        isActive: true
    },
    {
        name: 'Government of India Bond 2035',
        symbol: 'GOI2035',
        category: 'bond',
        pricePerUnit: 1050.00,
        peRatio: null,
        marketCap: null,
        yearHigh: 1080.00,
        yearLow: 1020.00,
        description: 'Government of India 7.26% Bond 2035 is a sovereign bond issued by the Government of India.',
        sector: 'Government Bond',
        historicalPrices: generateHistoricalPrices(1050.00, 30),
        isActive: true
    }
];

// Generate historical prices for the last N days
function generateHistoricalPrices(currentPrice, days) {
    const prices = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let price = currentPrice * 0.9; // Start at 90% of current price
    const volatility = 0.02; // 2% daily volatility

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // Add some random walk to the price
        const change = (Math.random() - 0.5) * 2 * volatility;
        price = price * (1 + change);

        prices.push({
            date: date,
            price: Math.round(price * 100) / 100
        });
    }

    return prices;
}

// Sample admin user
const adminUser = {
    name: 'Admin User',
    email: 'admin@tradepro.com',
    password: 'admin123',
    panNumber: 'ABCDE1234F',
    idImagePath: 'uploads/admin-id.jpg',
    role: 'admin',
    walletBalance: 1000000,
    isKYCVerified: true
};

// Sample demo user
const demoUser = {
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo123',
    panNumber: 'FGHIJ5678K',
    idImagePath: 'uploads/demo-id.jpg',
    role: 'user',
    walletBalance: 100000,
    isKYCVerified: true
};

const seedDatabase = async () => {
    try {
        // Clear existing data
        console.log('Clearing existing data...');
        await Product.deleteMany({});
        await User.deleteMany({});

        // Seed products
        console.log('Seeding products...');
        await Product.insertMany(sampleProducts);
        console.log(`✓ Created ${sampleProducts.length} products`);

        // Seed users
        console.log('Seeding users...');
        await User.create(adminUser);
        await User.create(demoUser);
        console.log('✓ Created admin and demo users');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\nDemo credentials:');
        console.log('📧 Email: demo@example.com');
        console.log('🔑 Password: demo123');
        console.log('\nAdmin credentials:');
        console.log('📧 Email: admin@tradepro.com');
        console.log('🔑 Password: admin123');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the seeding
connectDB().then(seedDatabase);

module.exports = {
    sampleProducts,
    adminUser,
    demoUser,
    seedDatabase
};