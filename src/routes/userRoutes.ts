import {userControllers} from "../controllers/index ";
import { Router } from "express";

const router = Router();

router.post('/signup', userControllers.signup);

export {router}