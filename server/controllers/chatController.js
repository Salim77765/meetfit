import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

// Get chat by activity ID
export const getChatByActivity = async (req, res) => {
  try {
    const { activityId } = req.params;

    // Find the activity
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if user is a participant in the activity
    if (!activity.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a participant in this activity to access the chat'
      });
    }

    // Find the chat
    const chat = await Chat.findOne({ activity: activityId })
      .populate('participants', 'username name profileImage')
      .populate({
        path: 'messages.sender',
        select: 'username name profileImage'
      });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send a message in a chat
export const sendMessage = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Find the activity
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if user is a participant in the activity
    if (!activity.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a participant in this activity to send messages'
      });
    }

    // Find the chat
    let chat = await Chat.findOne({ activity: activityId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Add message to chat
    const newMessage = {
      sender: req.user.id,
      content,
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Populate sender info for the new message
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'username name profileImage')
      .populate({
        path: 'messages.sender',
        select: 'username name profileImage'
      });

    // Get the newly added message
    const addedMessage = populatedChat.messages[populatedChat.messages.length - 1];

    res.status(201).json({
      success: true,
      message: addedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { activityId } = req.params;

    // Find the chat
    const chat = await Chat.findOne({ activity: activityId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is a participant in the chat
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a participant in this chat'
      });
    }

    // Mark all unread messages as read
    let updated = false;
    chat.messages.forEach(message => {
      if (!message.read && message.sender.toString() !== req.user.id) {
        message.read = true;
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get unread message count for user
export const getUnreadMessageCount = async (req, res) => {
  try {
    // Find all chats where user is a participant
    const chats = await Chat.find({ participants: req.user.id });

    let totalUnread = 0;
    const unreadByActivity = {};

    // Count unread messages in each chat
    chats.forEach(chat => {
      let unreadCount = 0;
      chat.messages.forEach(message => {
        if (!message.read && message.sender.toString() !== req.user.id) {
          unreadCount++;
          totalUnread++;
        }
      });

      if (unreadCount > 0) {
        unreadByActivity[chat.activity] = unreadCount;
      }
    });

    res.status(200).json({
      success: true,
      totalUnread,
      unreadByActivity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};