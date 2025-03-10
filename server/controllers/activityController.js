import Activity from '../models/Activity.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

// Create a new activity
export const createActivity = async (req, res) => {
  try {
    const { title, description, activityType, location, dateTime, duration, maxParticipants } = req.body;

    // Create new activity
    const activity = await Activity.create({
      creator: req.user.id,
      title,
      description,
      activityType,
      location,
      dateTime,
      duration,
      maxParticipants,
      participants: [req.user.id] // Creator is automatically a participant
    });

    // Create a chat for this activity
    await Chat.create({
      activity: activity._id,
      participants: [req.user.id]
    });

    res.status(201).json({
      success: true,
      activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all activities with filtering options
export const getActivities = async (req, res) => {
  try {
    const { activityType, location, dateFrom, dateTo, status } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (activityType) filter.activityType = activityType;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (status) filter.status = status;
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.dateTime = {};
      if (dateFrom) filter.dateTime.$gte = new Date(dateFrom);
      if (dateTo) filter.dateTime.$lte = new Date(dateTo);
    }

    const activities = await Activity.find(filter)
      .populate('creator', 'username name profileImage')
      .populate('participants', 'username name profileImage')
      .sort({ dateTime: 1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single activity by ID
export const getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('creator', 'username name profileImage bio')
      .populate('participants', 'username name profileImage');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update activity
export const updateActivity = async (req, res) => {
  try {
    const { title, description, activityType, location, dateTime, duration, maxParticipants, status } = req.body;

    let activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if user is the creator
    if (activity.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this activity'
      });
    }

    // Update activity
    activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { title, description, activityType, location, dateTime, duration, maxParticipants, status },
      { new: true, runValidators: true }
    ).populate('creator', 'username name profileImage')
      .populate('participants', 'username name profileImage');

    res.status(200).json({
      success: true,
      activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete activity
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if user is the creator
    if (activity.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this activity'
      });
    }

    // Delete associated chat
    await Chat.deleteMany({ activity: req.params.id });
    
    // Delete activity
    await activity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Join an activity
export const joinActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if activity is open
    if (activity.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: `Cannot join activity with status: ${activity.status}`
      });
    }

    // Check if user is already a participant
    if (activity.participants.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a participant in this activity'
      });
    }

    // Check if activity is full
    if (activity.maxParticipants > 0 && activity.participants.length >= activity.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'This activity is already full'
      });
    }

    // Add user to participants
    activity.participants.push(req.user.id);
    await activity.save();

    // Add user to chat participants
    const chat = await Chat.findOne({ activity: req.params.id });
    if (chat && !chat.participants.includes(req.user.id)) {
      chat.participants.push(req.user.id);
      await chat.save();
    }

    // Populate and return updated activity
    const updatedActivity = await Activity.findById(req.params.id)
      .populate('creator', 'username name profileImage')
      .populate('participants', 'username name profileImage');

    res.status(200).json({
      success: true,
      activity: updatedActivity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Leave an activity
export const leaveActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if user is a participant
    if (!activity.participants.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a participant in this activity'
      });
    }

    // Check if user is the creator
    if (activity.creator.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Creator cannot leave the activity. Please delete the activity instead.'
      });
    }

    // Remove user from participants
    activity.participants = activity.participants.filter(
      participant => participant.toString() !== req.user.id
    );
    await activity.save();

    // Remove user from chat participants
    const chat = await Chat.findOne({ activity: req.params.id });
    if (chat) {
      chat.participants = chat.participants.filter(
        participant => participant.toString() !== req.user.id
      );
      await chat.save();
    }

    res.status(200).json({
      success: true,
      message: 'You have left the activity successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get activities created by current user
export const getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ creator: req.user.id })
      .populate('creator', 'username name profileImage')
      .populate('participants', 'username name profileImage')
      .sort({ dateTime: 1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get activities joined by current user
export const getJoinedActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ 
      participants: req.user.id,
      creator: { $ne: req.user.id } // Exclude activities created by the user
    })
      .populate('creator', 'username name profileImage')
      .populate('participants', 'username name profileImage')
      .sort({ dateTime: 1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};