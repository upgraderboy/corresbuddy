import express from 'express';
import * as searchController from './search.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, searchController.search);

export default router;

