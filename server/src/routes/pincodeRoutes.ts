import { Router } from "express";
import { checkPincode } from "../controllers/pincodeController";

const router = Router();

router.get("/check", checkPincode);

export default router;
