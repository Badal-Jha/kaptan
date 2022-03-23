const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const router = Router();
const loginLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    code: 429,
    message: "To many request try after sometimes",
  },
});
router.get("/signup", authController.signup_get);
router.post("/signup", authController.signup_post);
router.get("/login", authController.login_get);
router.post("/login", loginLimit, authController.login_post);
router.get("/logout", authController.logout_get);
router.get("/forgot-password", authController.forgot_get);
router.post("/forgot-password", authController.forgot_post);
router.get("/reset-password/:id/:token", authController.reset_get);
router.post("/reset-password/:id/:token", authController.reset_post);
module.exports = router;
