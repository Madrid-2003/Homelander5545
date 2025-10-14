import fs from "fs";
import imagekit, { isImageKitConfigured } from "../config/imagekit.js";
import Property from "../models/propertymodel.js";

const addproperty = async (req, res) => {
    try {
        const { title, location, price, beds, baths, sqft, type, availability, description, amenities, phone } = req.body;

        // Check if required fields are provided
        if (!title || !location || !price || !type || !availability) {
            return res.status(400).json({ 
                message: "Missing required fields: title, location, price, type, and availability are required", 
                success: false 
            });
        }

        const image1 = req.files?.image1?.[0];
        const image2 = req.files?.image2?.[0];
        const image3 = req.files?.image3?.[0];
        const image4 = req.files?.image4?.[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        let imageUrls = [];

        // Upload images to ImageKit and delete after upload
        if (images.length > 0) {
            if (!isImageKitConfigured) {
                console.log("ImageKit not configured, skipping image upload");
                // Clean up uploaded files since we can't process them
                images.forEach(item => {
                    if (fs.existsSync(item.path)) {
                        fs.unlink(item.path, (err) => {
                            if (err) console.log("Error cleaning up file: ", err);
                        });
                    }
                });
                return res.status(500).json({ 
                    message: "Image upload service not configured. Please contact administrator.", 
                    success: false 
                });
            }

            try {
                imageUrls = await Promise.all(
                    images.map(async (item) => {
                        if (!fs.existsSync(item.path)) {
                            throw new Error(`File not found: ${item.path}`);
                        }
                        
                        const result = await imagekit.upload({
                            file: fs.readFileSync(item.path),
                            fileName: item.originalname,
                            folder: "Property",
                        });
                        
                        // Delete the temporary file after upload
                        fs.unlink(item.path, (err) => {
                            if (err) console.log("Error deleting the file: ", err);
                        });
                        
                        return result.url;
                    })
                );
            } catch (uploadError) {
                console.log("Error uploading images: ", uploadError);
                // Clean up any uploaded files if there was an error
                images.forEach(item => {
                    if (fs.existsSync(item.path)) {
                        fs.unlink(item.path, (err) => {
                            if (err) console.log("Error cleaning up file: ", err);
                        });
                    }
                });
                return res.status(500).json({ 
                    message: "Error uploading images", 
                    success: false 
                });
            }
        }

        // Create a new product
        const product = new Property({
            title,
            location,
            price,
            beds,
            baths,
            sqft,
            type,
            availability,
            description,
            amenities: amenities || [],
            image: imageUrls,
            phone
        });

        // Save the product to the database
        await product.save();

        res.json({ message: "Property added successfully", success: true });
    } catch (error) {
        console.log("Error adding property: ", error);
        
        // Clean up any uploaded files if there was an error
        if (req.files) {
            Object.values(req.files).forEach(fileArray => {
                fileArray.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlink(file.path, (err) => {
                            if (err) console.log("Error cleaning up file: ", err);
                        });
                    }
                });
            });
        }
        
        res.status(500).json({ 
            message: error.message || "Server Error", 
            success: false 
        });
    }
};

const listproperty = async (req, res) => {
    try {
        const property = await Property.find();
        res.json({ property, success: true });
    } catch (error) {
        console.log("Error listing products: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const removeproperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.body.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }
        return res.json({ message: "Property removed successfully", success: true });
    } catch (error) {
        console.log("Error removing product: ", error);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

const updateproperty = async (req, res) => {
    try {
        const { id, title, location, price, beds, baths, sqft, type, availability, description, amenities,phone } = req.body;

        const property = await Property.findById(id);
        if (!property) {
            console.log("Property not found with ID:", id); // Debugging line
            return res.status(404).json({ message: "Property not found", success: false });
        }

        if (!req.files) {
            // No new images provided
            property.title = title;
            property.location = location;
            property.price = price;
            property.beds = beds;
            property.baths = baths;
            property.sqft = sqft;
            property.type = type;
            property.availability = availability;
            property.description = description;
            property.amenities = amenities;
            property.phone = phone;
            // Keep existing images
            await property.save();
            return res.json({ message: "Property updated successfully", success: true });
        }

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        // Upload images to ImageKit and delete after upload
        const imageUrls = await Promise.all(
            images.map(async (item) => {
                const result = await imagekit.upload({
                    file: fs.readFileSync(item.path),
                    fileName: item.originalname,
                    folder: "Property",
                });
                fs.unlink(item.path, (err) => {
                    if (err) console.log("Error deleting the file: ", err);
                });
                return result.url;
            })
        );

        property.title = title;
        property.location = location;
        property.price = price;
        property.beds = beds;
        property.baths = baths;
        property.sqft = sqft;
        property.type = type;
        property.availability = availability;
        property.description = description;
        property.amenities = amenities;
        property.image = imageUrls;
        property.phone = phone;

        await property.save();
        res.json({ message: "Property updated successfully", success: true });
    } catch (error) {
        console.log("Error updating product: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const singleproperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }
        res.json({ property, success: true });
    } catch (error) {
        console.log("Error fetching property:", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

export { addproperty, listproperty, removeproperty, updateproperty , singleproperty};