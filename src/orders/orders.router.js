const router = require("express").Router();
const path = require("path");
const controller = require("./orders.controller");
const methodNotAllowed = require(path.resolve("src/errors/methodNotAllowed"));

// TODO: Implement the /orders routes needed to make the tests pass

router
  .route("/:orderId")
  .get(controller.getOrder)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed);

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
