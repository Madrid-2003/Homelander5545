import ImageKit from 'imagekit';
import dotenv from 'dotenv';

// Try to load environment variables from multiple possible locations
dotenv.config({ path: './.env.local' });
dotenv.config({ path: './.env' });

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Check if ImageKit is properly configured
const isImageKitConfigured = process.env.IMAGEKIT_PUBLIC_KEY && 
                            process.env.IMAGEKIT_PRIVATE_KEY && 
                            process.env.IMAGEKIT_URL_ENDPOINT;

if (!isImageKitConfigured) {
  console.warn('⚠️  ImageKit not configured. Environment variables missing:');
  if (!process.env.IMAGEKIT_PUBLIC_KEY) console.warn('  - IMAGEKIT_PUBLIC_KEY');
  if (!process.env.IMAGEKIT_PRIVATE_KEY) console.warn('  - IMAGEKIT_PRIVATE_KEY');
  if (!process.env.IMAGEKIT_URL_ENDPOINT) console.warn('  - IMAGEKIT_URL_ENDPOINT');
  console.warn('  Image uploads will be disabled. Please configure ImageKit environment variables.');
} else {
  console.log("✅ ImageKit connected successfully!");
}

export default imagekit;
export { isImageKitConfigured };