if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const Restaurant = require('../models/restaurant')
const restaurants = require('./restaurants')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/food-map';

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB = async () => {
    await Restaurant.deleteMany({});
    for (let restaurant of restaurants) {
        const geoData = await geocoder.forwardGeocode({
            query: restaurant.address,
            limit: 1
        }).send()
        const r = new Restaurant({
            title: restaurant.title,
            image: restaurant.image,
            geometry: geoData.body.features[0].geometry,
            phone: restaurant.phone,
            address: restaurant.address,
            time: restaurant.time,
            source: restaurant.source,
            // admin's id
            author: '652388be1e7805dbbd353e8a'
        })
        await r.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})