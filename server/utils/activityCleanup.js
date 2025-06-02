import Activity from '../models/Activity.js';

/**
 * Marks activities as completed when they have expired (past their date and time + duration)
 * This function will be scheduled to run periodically
 */
export const cleanupExpiredActivities = async () => {
  try {
    const now = new Date();
    
    // Find activities that should have ended by now
    // We need to use aggregation to calculate the end time (dateTime + duration)
    const expiredActivities = await Activity.aggregate([
      {
        $match: {
          status: { $nin: ['cancelled', 'completed'] } // Only check active activities
        }
      },
      {
        $addFields: {
          // Calculate end time by adding duration (in minutes) to dateTime
          endTime: {
            $add: [
              '$dateTime',
              { $multiply: ['$duration', 60 * 1000] } // Convert minutes to milliseconds
            ]
          }
        }
      },
      {
        $match: {
          endTime: { $lt: now } // Filter activities where end time is in the past
        }
      }
    ]);
    
    // Update all expired activities to 'completed' status
    if (expiredActivities.length > 0) {
      const activityIds = expiredActivities.map(activity => activity._id);
      
      const updateResult = await Activity.updateMany(
        { _id: { $in: activityIds } },
        { $set: { status: 'completed' } }
      );
      
      console.log(`Marked ${updateResult.modifiedCount} expired activities as completed`);
      
      // Log the activities that were marked as completed
      expiredActivities.forEach(activity => {
        console.log(`Activity expired and marked as completed: ${activity.title} (${activity._id})`);
      });
    } else {
      console.log('No expired activities found to clean up');
    }
    
    console.log('Expired activity cleanup completed successfully');
    return expiredActivities.length;
  } catch (error) {
    console.error('Error cleaning up expired activities:', error);
    throw error;
  }
};

/**
 * Permanently deletes activities that have been completed for a long time
 * This helps keep the database clean by removing old completed activities
 * @param {number} daysOld - Number of days after which completed activities should be deleted
 */
export const deleteOldCompletedActivities = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    // Find and delete activities that were completed more than 'daysOld' days ago
    const result = await Activity.deleteMany({
      status: 'completed',
      updatedAt: { $lt: cutoffDate }
    });
    
    console.log(`Deleted ${result.deletedCount} old completed activities`);
  } catch (error) {
    console.error('Error deleting old completed activities:', error);
  }
};