import express from 'express';
import * as resourcesController from './resources.controller.js';
import { authenticate } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.get('/', authenticate, resourcesController.listResources);
router.get('/saved/me', authenticate, resourcesController.getSaved);
router.get('/:id', authenticate, resourcesController.getResource);
router.post('/', authenticate, resourcesController.createResource);
router.post('/:id/upload', authenticate, upload.single('file'), resourcesController.uploadFile);
router.patch('/:id', authenticate, resourcesController.updateResource);
router.delete('/:id', authenticate, resourcesController.deleteResource);
router.get('/:id/download', authenticate, resourcesController.getDownload);
router.post('/:id/download', authenticate, resourcesController.getDownload);
router.post('/:id/save', authenticate, resourcesController.saveResource);
router.delete('/:id/save', authenticate, resourcesController.unsaveResource);

export default router;

