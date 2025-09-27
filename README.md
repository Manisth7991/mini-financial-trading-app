# 🚀 Mini Financial Trading App

A complete full-stack financial trading application built with **Node.js**, **Express**, **MongoDB**, **React**, and **TailwindCSS**. Features include user authentication with KYC, investment portfolio management, real-time product listings, transaction tracking, and watchlist functionality.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Demo Credentials](#-demo-credentials)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication & KYC
- **Secure Signup**: Complete KYC form with PAN validation and ID image upload
- **JWT Authentication**: Secure token-based authentication system
- **Password Security**: bcrypt hashing for password protection
- **Role-based Access**: User and Admin roles with different permissions

### 💰 Investment Management
- **Virtual Wallet**: Start with ₹1,00,000 virtual balance
- **Product Trading**: Buy stocks, mutual funds, ETFs, and bonds
- **Portfolio Tracking**: Real-time portfolio value and returns calculation
- **Transaction History**: Complete transaction logs with details

### 📊 Product Features
- **Product Catalog**: Browse 7+ investment products across categories
- **Interactive Charts**: Price history with Recharts integration
- **Search & Filter**: Advanced filtering by category, price, and search terms
- **Product Details**: Comprehensive information including P/E ratios, market cap

### 📈 Dashboard & Analytics
- **Portfolio Dashboard**: Overview of investments, returns, and performance
- **Watchlist**: Save interesting products for later
- **Transaction Tracking**: Complete history of all trades
- **Performance Charts**: Visual representation of portfolio allocation

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt, helmet, rate limiting
- **File Upload**: Multer for image handling
- **Validation**: Built-in validation with custom validators

### Frontend
- **Framework**: React 18 with Hooks
- **Routing**: React Router DOM v6
- **Styling**: TailwindCSS with custom components
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

### Development Tools
- **Process Manager**: Nodemon for development
- **Package Manager**: npm
- **Version Control**: Git

## 📁 Project Structure

```
mini_financial_trading_app/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Transaction.js
│   │   │   ├── Portfolio.js
│   │   │   └── Watchlist.js
│   │   ├── routes/          # API routes
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── transactions.js
│   │   │   ├── portfolio.js
│   │   │   └── watchlist.js
│   │   ├── middleware/      # Custom middleware
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   ├── utils/          # Utility functions
│   │   │   ├── database.js
│   │   │   ├── helpers.js
│   │   │   └── seedData.js
│   │   └── server.js       # Express server
│   ├── uploads/            # File upload directory
│   ├── package.json
│   └── .env               # Environment variables
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/          # Page components
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ProductList.js
│   │   │   └── ProductDetail.js
│   │   ├── context/        # React Context
│   │   │   └── AuthContext.js
│   │   ├── services/       # API services
│   │   │   ├── api.js
│   │   │   └── index.js
│   │   ├── utils/          # Utility functions
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Installation guide](https://docs.mongodb.com/manual/installation/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mini_financial_trading_app
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. **Create Environment File**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Update Environment Variables** in `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/trading_app
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production_minimum_32_characters
   JWT_EXPIRE=30d
   MAX_FILE_SIZE=5000000
   UPLOAD_PATH=./uploads
   ```

### Frontend Configuration

The frontend is configured to proxy API requests to `http://localhost:5000` during development. No additional configuration needed for development.

For production, update the API base URL in `frontend/src/services/api.js`.

## 🗄️ Database Setup

### 1. Start MongoDB

Make sure MongoDB is running on your system:

**Windows**:
```bash
mongod
```

**macOS** (with Homebrew):
```bash
brew services start mongodb-community
```

**Linux**:
```bash
sudo systemctl start mongod
```

### 2. Seed the Database

Populate the database with sample data:

```bash
cd backend
npm run seed
```

This will create:
- **7 sample investment products** (stocks, mutual funds, ETFs, bonds)
- **Demo user account** with ₹1,00,000 balance
- **Admin user account** with ₹10,00,000 balance

## 🏃‍♂️ Running the Application

### Method 1: Run Both Servers Separately

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```
Server will start on http://localhost:5000

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```
React app will start on http://localhost:3000

### Method 2: Production Build

**Build Frontend**:
```bash
cd frontend
npm run build
```

**Start Backend** (serves both API and static files):
```bash
cd backend
npm start
```

Visit http://localhost:5000 to access the application.

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/signup
Content-Type: multipart/form-data

Body:
- name: string (required)
- email: string (required)
- password: string (required, min 6 chars)
- panNumber: string (required, format: ABCDE1234F)
- idImage: file (required, image only, max 5MB)
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

Body:
{
  "email": "demo@example.com",
  "password": "demo123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Product Endpoints

#### Get All Products
```http
GET /products?category=stock&search=tata&sort=price_low&page=1&limit=10
```

#### Get Single Product
```http
GET /products/:id
```

#### Get Product Chart Data
```http
GET /products/:id/chart?period=1M
```

### Transaction Endpoints

#### Buy Product
```http
POST /transactions/buy
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "product_id_here",
  "units": 10
}
```

#### Get Transaction History
```http
GET /transactions?page=1&limit=10&type=buy&status=completed
Authorization: Bearer <token>
```

### Portfolio Endpoints

#### Get Portfolio
```http
GET /portfolio
Authorization: Bearer <token>
```

#### Get Portfolio Performance
```http
GET /portfolio/performance?period=1M
Authorization: Bearer <token>
```

#### Get Portfolio Statistics
```http
GET /portfolio/stats
Authorization: Bearer <token>
```

### Watchlist Endpoints

#### Get Watchlist
```http
GET /watchlist
Authorization: Bearer <token>
```

#### Add to Watchlist
```http
POST /watchlist/add/:productId
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "notes": "Interesting stock to watch"
}
```

#### Remove from Watchlist
```http
DELETE /watchlist/remove/:productId
Authorization: Bearer <token>
```

### Admin Endpoints (Admin Only)

#### Get Admin Dashboard
```http
GET /admin/dashboard
Authorization: Bearer <admin_token>
```

#### Get All Users
```http
GET /admin/users?page=1&limit=10&search=john&role=user
Authorization: Bearer <admin_token>
```

#### Get All Transactions
```http
GET /admin/transactions?page=1&limit=20&type=buy&userId=user_id
Authorization: Bearer <admin_token>
```

#### Update User Role
```http
PUT /admin/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

Body:
{
  "role": "admin"
}
```

## 🔑 Demo Credentials

### Regular User Account
- **Email**: `demo@example.com`
- **Password**: `demo123`
- **Initial Balance**: ₹1,00,000

### Admin Account
- **Email**: `admin@tradepro.com`
- **Password**: `admin123`
- **Features**: User management, transaction monitoring, platform analytics
- **Initial Balance**: ₹10,00,000

## 🎯 Usage Guide

### 1. Getting Started
1. Register a new account or use demo credentials
2. Complete the KYC process (demo accounts are pre-verified)
3. Explore the dashboard to see your wallet balance and portfolio

### 2. Investing
1. Browse products in the **Products** section
2. Use filters to find stocks, mutual funds, ETFs, or bonds
3. Click on any product to view detailed information and charts
4. Click **Buy Now** to purchase units
5. Track your investments in the **Portfolio** section

### 3. Managing Investments
1. View portfolio performance and returns in the **Dashboard**
2. Check individual holdings and their performance
3. Review transaction history
4. Use the **Watchlist** to save products for later

## 🔧 Development

### Available Scripts

**Backend**:
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

**Frontend**:
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Code Structure

The application follows a modular architecture:

- **Backend**: RESTful API with Express.js and MongoDB
- **Frontend**: Single Page Application with React and React Router
- **Authentication**: JWT-based with protected routes
- **State Management**: React Context API for global state
- **Styling**: TailwindCSS with custom components

## 🔒 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive input validation and sanitization
- **File Upload Security**: Restricted file types and sizes
- **CORS Protection**: Configured for secure cross-origin requests
- **Helmet.js**: Security headers for Express app

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify database permissions

2. **Port Already in Use**:
   - Change the PORT in backend `.env` file
   - Kill existing processes: `npx kill-port 5000`

3. **File Upload Issues**:
   - Ensure `uploads/` directory exists in backend
   - Check file size limits in configuration

4. **Frontend Build Issues**:
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear browser cache
   - Check for version conflicts

## 🚀 Deployment

### Production Deployment

1. **Prepare Environment**:
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure production MongoDB URI

2. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy to Hosting Service**:
   - **Heroku**: Use provided Procfile
   - **AWS/DigitalOcean**: Set up PM2 for process management
   - **Vercel/Netlify**: Deploy frontend separately with API proxy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MongoDB** for the excellent database platform
- **React** team for the amazing frontend framework
- **TailwindCSS** for the utility-first CSS framework
- **Recharts** for beautiful data visualization components

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [API Documentation](#-api-documentation)
3. Create an issue on the repository

---

**Built with ❤️ by [Your Name]**

*Happy Trading! 📈*