import express from 'express';
import * as chatController from './chat.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, chatController.listConversations);
router.get('/:id', authenticate, chatController.getConversation);
router.get('/:id/messages', authenticate, chatController.getMessages);
router.post('/', authenticate, chatController.openConversation);
router.post('/:id/read', authenticate, chatController.markRead);

export default router;

