import { Schema, model } from 'mongoose';

const activitySchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  activityType: {
    type: String,
    required: [true, 'Activity type is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  dateTime: {
    type: Date,
    required: [true, 'Date and time are required']
  },
  duration: {
    type: Number,  // Duration in minutes
    required: [true, 'Duration is required']
  },
  maxParticipants: {
    type: Number,
    default: 0  // 0 means unlimited
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['open', 'full', 'cancelled', 'completed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for checking if activity is full
activitySchema.virtual('isFull').get(function() {
  if (this.maxParticipants === 0) return false;
  return this.participants.length >= this.maxParticipants;
});

// Virtual for checking if activity is expired
activitySchema.virtual('isExpired').get(function() {
  const now = new Date();
  const activityEndTime = new Date(this.dateTime);
  activityEndTime.setMinutes(activityEndTime.getMinutes() + this.duration);
  return activityEndTime < now;
});

// Pre-save middleware to update status if activity is full
activitySchema.pre('save', function(next) {
  if (this.maxParticipants > 0 && this.participants.length >= this.maxParticipants) {
    this.status = 'full';
  }
  next();
});

const Activity = model('Activity', activitySchema);

export default Activity;