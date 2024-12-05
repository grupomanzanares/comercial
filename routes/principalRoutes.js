
import express from 'express'
import { admin } from '../controllers/principalController.js';

const router = express.Router()

router.get('/principal',  admin)


export default router;   //Exporta un elemento