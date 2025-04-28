import express  from "express";
import { deleteUser, getUsers, signout, test, updateUser } from "../controllers/user.controller.js";


const router = express.Router();

router.get('/test',test);
router.get('/signout',signout);
router.put("/update/:id" , updateUser);
router.delete("/delete/:id" ,  deleteUser);
router.get('/users', getUsers);


export default router;