import * as chatService from './chat.service.js';

export const listConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.listConversations(req.user.id);
    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const conversation = await chatService.getConversationById(req.params.id, req.user.id);
    res.json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await chatService.getMessages(req.params.id, req.user.id, req.query);
    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

export const openConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (!participantId) {
      return res.status(400).json({ success: false, message: 'participantId is required' });
    }
    const conversation = await chatService.openOrCreateConversation(req.user.id, participantId);
    res.status(201).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    await chatService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

export default {
  listConversations,
  getConversation,
  getMessages,
  openConversation,
  markRead,
};

