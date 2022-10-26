const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
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
  res.json({ data: orders });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  }
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function orderIsValid(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  let message;
  
  if(dishes.length === 0 || !Array.isArray(dishes))
		message = "Order must include at least one dish";
  else {
    for(let i = 0; i < dishes.length; i++) {
      if(!dishes[i].quantity || dishes[i].quantity <= 0 || !Number.isInteger(dishes[i].quantity)) {
        message = `Dish ${i} must have a quantity that is an integer greater than 0`;
      }
	}
  }

  if(message) {
    next({
      status: 400,
      message: message,
	});
  }
  next();
}

function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  } else {
    next({
      status: 404,
      message: `Order does not exist: ${orderId}`
    });
  }
}

function getOrder(req, res) {
  res.json({ data: res.locals.order })
}

function orderIdMatchesParams(req, res, next) {
  const orderId = req.params.orderId;
  const { data: { id } = {} } = req.body;
  if (orderId === id || !id) {
    next();
  } else {
    next({
      status: 400,
      message: `Order id does not match route id. Dish: ${id}, Route: ${orderId}`
    });
  }
}

function update(req, res) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;
  
  res.json({ data: order });
}

function statusIsValid(req, res, next) {
  const { orderId } = req.params;
  const { data: { status } = {} } = req.body;

  let message;
  
  if (!status || status === "" || status === "invalid") {
    message = "Order must have a status of pending, preparing, out-for-delivery, delivered";
  } else if(status === "delivered") {
    message = "A delivered order cannot be changed"
  }
    
  if (message) {
    return next({
      status: 400,
      message: message,
    });
  }
  next();
}

function destroy(req, res, next) {
  const order = res.locals.order;
  const orderId = req.params.orderId;
  const index = orders.findIndex((order) => order.id === orderId)
  if (index > -1 && order.status === 'pending') {
    orders.splice(index, 1)
  } else {
    return next({
      status: 400,
      message: 'An order cannot be deleted unless it is pending'
    });
  }
  res.sendStatus(204)
}

module.exports = {
  list,
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    orderIsValid,
    create,
  ],
  getOrder: [orderExists, getOrder],
  update: [
    orderExists,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    orderIdMatchesParams,
    orderIsValid,
    statusIsValid,
    update
  ],
  delete: [
    orderExists,
    destroy
  ]
}