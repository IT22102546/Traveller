import express  from "express";
import { signout, test, updateUser } from "../controllers/user.controller.js";


const router = express.Router();

router.get('/test',test);
router.get('/signout',signout);
router.put("/update/:id" , updateUser);



export default router;