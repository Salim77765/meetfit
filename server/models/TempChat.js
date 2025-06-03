import { Schema, model } from 'mongoose';

const tempChatSchema = new Schema({
  activity: {
    type: Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TempChat = model('TempChat', tempChatSchema);

export default TempChat;