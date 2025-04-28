import express  from "express";
import { deleteUser, signout, test, updateUser } from "../controllers/user.controller.js";


const router = express.Router();

router.get('/test',test);
router.get('/signout',signout);
router.put("/update/:id" , updateUser);
router.delete("/delete/:id" ,  deleteUser);



export default router;