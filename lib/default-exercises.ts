/**
 * Default exercises seeded for every new user.
 * Shared between the signup route and the exercises API (auto-seed on first fetch).
 */
export function getDefaultExercises(userId: string) {
  return [
    // Chest
    { name: 'Bench Press', muscleGroup: 'chest', icon: 'Dumbbell', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Incline Press', muscleGroup: 'chest', icon: 'Dumbbell', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Cable Fly', muscleGroup: 'chest', icon: 'Cable', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Dumbbell Fly', muscleGroup: 'chest', icon: 'Dumbbell', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Push Ups', muscleGroup: 'chest', icon: 'User', difficulty: 'beginner', isDefault: true, userId },
    // Back
    { name: 'Pull Ups', muscleGroup: 'back', icon: 'ArrowUp', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Lat Pulldown', muscleGroup: 'back', icon: 'ArrowDown', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Deadlift', muscleGroup: 'back', icon: 'Dumbbell', difficulty: 'advanced', isDefault: true, userId },
    { name: 'Barbell Rows', muscleGroup: 'back', icon: 'Dumbbell', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Cable Rows', muscleGroup: 'back', icon: 'Cable', difficulty: 'beginner', isDefault: true, userId },
    // Legs
    { name: 'Squats', muscleGroup: 'legs', icon: 'Dumbbell', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Leg Press', muscleGroup: 'legs', icon: 'Square', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Lunges', muscleGroup: 'legs', icon: 'Footprints', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Leg Extensions', muscleGroup: 'legs', icon: 'Zap', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Leg Curls', muscleGroup: 'legs', icon: 'Zap', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Calf Raises', muscleGroup: 'legs', icon: 'ArrowUp', difficulty: 'beginner', isDefault: true, userId },
    // Shoulders
    { name: 'Overhead Press', muscleGroup: 'shoulders', icon: 'ArrowUp', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Lateral Raises', muscleGroup: 'shoulders', icon: 'Expand', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Front Raises', muscleGroup: 'shoulders', icon: 'ArrowUp', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Rear Delt Fly', muscleGroup: 'shoulders', icon: 'Expand', difficulty: 'beginner', isDefault: true, userId },
    // Arms
    { name: 'Bicep Curls', muscleGroup: 'arms', icon: 'Dumbbell', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Hammer Curls', muscleGroup: 'arms', icon: 'Dumbbell', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Tricep Pushdowns', muscleGroup: 'arms', icon: 'ArrowDown', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Tricep Dips', muscleGroup: 'arms', icon: 'ArrowDown', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Skull Crushers', muscleGroup: 'arms', icon: 'Dumbbell', difficulty: 'intermediate', isDefault: true, userId },
    // Core
    { name: 'Crunches', muscleGroup: 'core', icon: 'Target', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Planks', muscleGroup: 'core', icon: 'Minus', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Leg Raises', muscleGroup: 'core', icon: 'ArrowUp', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Russian Twists', muscleGroup: 'core', icon: 'RotateCw', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Mountain Climbers', muscleGroup: 'core', icon: 'Mountain', difficulty: 'intermediate', isDefault: true, userId },
  ]
}
