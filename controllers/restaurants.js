const Restaurant = require('../models/restaurant');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async(req, res) => {
    const restaurants = await Restaurant.find({});
    res.render('restaurants/index', {restaurants});
}

module.exports.renderNewForm = (req, res) => {
    res.render('restaurants/new');
}

module.exports.createRestaurant = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.restaurant.address,
        limit: 1
    }).send()
    const restaurant = new Restaurant(req.body.restaurant);
    restaurant.geometry = geoData.body.features[0].geometry;
    restaurant.author = req.user._id;
    await restaurant.save();
    req.flash('success', '成功新增一間餐廳！');
    res.redirect(`/restaurants/${restaurant._id}`)
}

module.exports.showRestaurant = async (req, res,) => {
    const restaurant = await Restaurant.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!restaurant){
        req.flash('error', '查無此餐廳！')
        return res.redirect('/restaurants')
    }
    res.render('restaurants/show', { restaurant });
}

module.exports.renderEditForm = async(req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
    if(!restaurant){
        req.flash('error', '查無此餐廳！')
        return res.redirect('/restaurants')
    }
    res.render('restaurants/edit', { restaurant });
}

module.exports.updateRestaurant = async(req, res) => {
    const {id} = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(id, {...req.body.restaurant});
    req.flash('success', '成功更新一間餐廳！');
    res.redirect(`/restaurants/${restaurant._id}`)
}

module.exports.deleteRestaurant = async(req, res) => {
    const {id} = req.params;
    await Restaurant.findByIdAndDelete(id);
    req.flash('success', '成功刪除一間餐廳！');
    res.redirect('/restaurants');
}
