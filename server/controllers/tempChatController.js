import TempChat from '../models/TempChat.js';
import Activity from '../models/Activity.js';

// @desc    Send a temporary chat message
// @route   POST /api/tempchat/:activityId
// @access  Private (members of the activity)
export const sendTempMessage = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { message } = req.body;
    const sender = req.user.id; // Assuming user ID is available from auth middleware

    // Check if the user is a member of the activity
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ msg: 'Activity not found' });
    }

    if (!activity.participants.includes(sender)) {
      return res.status(403).json({ msg: 'Not authorized to send messages to this activity' });
    }

    const tempMessage = new TempChat({
      activity: activityId,
      sender,
      message,
    });

    await tempMessage.save();

    res.status(201).json(tempMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get temporary chat messages for an activity
// @route   GET /api/tempchat/:activityId
// @access  Private (members of the activity)
export const getTempMessages = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id; // Assuming user ID is available from auth middleware

    // Check if the user is a member of the activity
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ msg: 'Activity not found' });
    }

    if (!activity.participants.includes(userId)) {
      return res.status(403).json({ msg: 'Not authorized to view messages for this activity' });
    }

    const messages = await TempChat.find({ activity: activityId })
      .populate('sender', 'username profileImage') // Populate sender details
      .sort('createdAt');

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};