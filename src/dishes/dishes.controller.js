const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Dish must include a ${propertyName}` });
  };
}

function list(req, res) {
  res.json({ data: dishes });
}

function priceIsValid(req, res, next){
  const { data: { price }  = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)){
      return next({
          status: 400,
          message: `Dish must have a price that is an integer greater than 0`
      });
  }
  next();
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  } else {
    next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  }
}

function getDish(req, res) {
  res.status(200).json({ data: res.locals.dish });
}

function dishIdMatchesParams(req, res, next) {
  const dishId = req.params.dishId;
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  if (dishId === id || !id) {
    next();
  } else {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    });
  }
}

function update(req, res) {
  const dish = res.locals.dish
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  
  dish.id = id;
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;
  
  res.json({ data: dish });
}

module.exports = {
  list,
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("image_url"),
    priceIsValid,
    create
  ],
  getDish: [dishExists, getDish],
  update: [
    dishExists,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("image_url"),
    priceIsValid,
    dishIdMatchesParams,
    update
  ],
}