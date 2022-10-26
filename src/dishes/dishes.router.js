const router = require("express").Router();
const path = require("path");
const controller = require("./dishes.controller");
const methodNotAllowed = require(path.resolve("src/errors/methodNotAllowed"));

// TODO: Implement the /dishes routes needed to make the tests pass

router
  .route("/:dishId")
  .get(controller.getDish)
  .put(controller.update)
  .all(methodNotAllowed);

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
