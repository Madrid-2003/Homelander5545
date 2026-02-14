# Backend Setup Instructions

## Environment Variables Required

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=your_mongodb_connection_string_here

# ImageKit Configuration (for image uploads)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key_here
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key_here
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint_here

# Email Configuration (for notifications)
EMAIL_USER=your_email_here
EMAIL_PASS=your_email_password_here

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=4000
NODE_ENV=development
```

## ImageKit Setup (Required for Image Uploads)

1. Go to [ImageKit.io](https://imagekit.io) and create an account
2. Get your Public Key, Private Key, and URL Endpoint from the dashboard
3. Add these values to your `.env` file

## MongoDB Setup

1. Create a MongoDB Atlas account or use a local MongoDB instance
2. Get your connection string and add it to the `MONGODB_URI` variable

## Running the Server

1. Install dependencies: `npm install`
2. Create the `.env` file with the required variables
3. Start the server: `npm start`

## Troubleshooting

- If you get "Image upload service not configured" error, make sure ImageKit environment variables are set
- If you get database connection errors, check your MongoDB URI
- The uploads directory is automatically created when the server starts

