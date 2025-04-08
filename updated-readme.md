# README - Backend API

## Project Requirements
To run this project, you'll need the following tools and dependencies:

### Tools
- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [MongoDB](https://www.mongodb.com/) (Local or via MongoDB Atlas)
- [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) for API testing

### Dependencies
- Express.js (Backend framework)
- Mongoose (MongoDB ODM)
- Validation and Authentication Middleware
- JWT for Authentication
- bcryptjs for Password Hashing

## Installation and Setup

1. **Clone the Project**
   ```sh
   git clone <https://github.com/Martensven/Backend-Project.git>
   cd <BACKEND-PROJECT>
   ```

2. **Initialize and Install Dependencies**
   ```sh
   npm init -y
   npm install express mongoose bcryptjs jsonwebtoken dotenv express-session cors
   ```

3. **Environment Configuration**
   - Create a `.env` file in the root directory
   - Add necessary environment variables:
     ```
     PORT=4321
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     ```

4. **Start the Server**
   ```sh
   npm start
   ```

## Project Structure
```
backend-project/
│
├── middlewares/
│   ├── dataValidation.js     # Centralized data validation
│   ├── campaignsValidation.js # Campaign calculation middleware
│   └── middleware.js         # Authentication middleware
│
├── models/
│   ├── cart.js
│   ├── items.js
│   ├── orders.js
│   └── users.js
│
├── routes/
│   ├── about-route.js
│   ├── cart-route.js
│   ├── item-route.js
│   ├── order-route.js
│   └── user-route.js
│
└── server.js
```

## Data Validation Approach
The project uses a centralized validation middleware (`dataValidation.js`) that:
- Checks for required fields
- Validates data types
- Ensures JSON content type
- Provides consistent error handling

Example validation:
```javascript
// Validate that title exists and is a string
validateData(['title'], { title: 'string' })
```

## Authentication
- JWT (JSON Web Tokens) used for authentication
- Passwords hashed using bcryptjs
- Token expires after 1 hour

## Endpoints Overview

### 1. Users
- `POST /register`: Create a new user
- `POST /login`: User login, receive JWT token

### 2. Items
- `GET /items`: Retrieve all items
- `GET /items/:id`: Get specific item by MongoDB ID
- `GET /items/by-number/:id`: Get item by numeric ID

### 3. Cart
- `POST /cart/add`: Add item to cart
- `GET /cart/`: Retrieve current cart
- `POST /cart/remove`: Remove or reduce item quantity

### 4. Orders
- `POST /orders`: Create order from cart
- `GET /orders/user/:userId`: Get user's orders
- `PUT /orders/:orderId/status`: Update order status

### 5. About
- `POST /about`: Create about entry
- `GET /about`: Retrieve all about entries
- `GET /about/:id`: Get specific about entry
- `PUT /about/:id`: Update about entry
- `DELETE /about/:id`: Delete about entry

## Testing
- Use Postman or Insomnia to test endpoints
- Ensure proper authentication for protected routes
- Validate request bodies match expected formats

## Error Handling
- Consistent error responses
- Descriptive error messages
- Appropriate HTTP status codes

## Security Considerations
- Password hashing
- JWT authentication
- Input validation
- Protection against common web vulnerabilities

## Troubleshooting
- Check MongoDB connection
- Verify `.env` file configuration
- Ensure all dependencies are installed
- Check server logs for detailed error information

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
