# Feature Implementation: Directional Arrow and Vibration

This document outlines the steps to add a new feature to your application. When a user starts recording, a directional arrow (left or right) will appear. If the user tilts the phone in the indicated direction, the arrow will turn green. If they tilt it in the opposite direction, the phone will vibrate.

## High-Level Plan

1.  **State Management**: We'll introduce a new state variable in `CameraView.tsx` to store the target direction (`'left'`, `'right'`, or `null`). This direction will be randomly set when recording starts.
2.  **Vibration Logic**: We'll add a `useEffect` hook in `CameraView.tsx` that listens to the user's movement. If the movement is opposite to the target direction, it will trigger the phone's vibration using Expo's `Vibration` API.
3.  **UI Component**: We will repurpose the existing (and currently unused) `DirectionArrow.tsx` component to display the arrow, handle its rotation, and manage its color based on the user's movement relative to the target direction.
4.  **Integration**: We will render the updated `DirectionArrow` component within `CameraView.tsx` and pass the required state to it.

---

## Detailed Implementation Steps

### Step 1: Update Type Definitions

First, let's define a type for our new direction state.

**File**: `types/index.ts`

Add the following type definition to the file:

```typescript
export type Direction = 'left' | 'right' | null;
```

We also need to update the props for `DirectionArrow`. Find the `ArrowProps` interface and replace it with this:

```typescript
// Replace the old ArrowProps
export interface ArrowProps {
  targetDirection: Direction;
  userMovement: UserMovementState;
  isVisible: boolean;
}
```

### Step 2: Modify `CameraView.tsx` to Manage State and Vibration

This is where we'll manage the core logic for the new feature.

**File**: `components/CameraView.tsx`

1.  **Import necessary modules**: Add `Vibration` from `react-native` and the new `Direction` type.
2.  **Add state for `targetDirection`**: We'll use `useState` to manage the arrow's direction.
3.  **Update `toggleRecording`**: Modify the `toggleRecording` logic to set a random direction when recording starts and clear it when it stops.
4.  **Add `useEffect` for vibration**: This effect will run whenever the user's movement changes and trigger vibration on incorrect movement.
5.  **Render `DirectionArrow`**: Add the `DirectionArrow` component to the JSX.

Here are the changes:

```typescript
import React from 'react';
import { View, StyleSheet, Text, Vibration } from 'react-native'; // Import Vibration
import { CameraView as ExpoCameraView } from 'expo-camera';
import { MovementDisplay } from './MovementDisplay';
import { RecordingButton } from './RecordingButton';
import { DirectionArrow } from './DirectionArrow'; // Import DirectionArrow
import { useCamera } from '../hooks/useCamera';
import { useUserMovement } from '../hooks/useUserMovement';
import { CameraViewProps, Direction } from '../types'; // Import Direction

export const CameraView: React.FC<CameraViewProps> = ({ onRecordingStateChange }) => {
  const { cameraRef, recordingState, toggleRecording: originalToggleRecording } = useCamera();
  const userMovement = useUserMovement(recordingState.isRecording);
  
  // State to hold the target direction for the user
  const [targetDirection, setTargetDirection] = React.useState<Direction>(null);

  // Wrapper for toggleRecording to add our new logic
  const toggleRecording = () => {
    if (!recordingState.isRecording) {
      // Set a random direction when starting to record
      const newDirection = Math.random() < 0.5 ? 'left' : 'right';
      setTargetDirection(newDirection);
    } else {
      // Clear direction when stopping
      setTargetDirection(null);
    }
    originalToggleRecording();
  };

  // Effect to handle vibration for incorrect movement
  React.useEffect(() => {
    if (!recordingState.isRecording || !targetDirection) return;

    const movedOpposite = 
      (targetDirection === 'left' && userMovement.isMovingRight) ||
      (targetDirection === 'right' && userMovement.isMovingLeft);

    if (movedOpposite) {
      Vibration.vibrate(100); // Vibrate for 100ms
    }
  }, [userMovement, targetDirection, recordingState.isRecording]);


  React.useEffect(() => {
    onRecordingStateChange(recordingState);
  }, [recordingState, onRecordingStateChange]);

  return (
    <View style={styles.container}>
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="video"
      />
      
      {/* The existing MovementDisplay can be kept or removed */}
      <MovementDisplay 
        userMovement={userMovement}
        isVisible={recordingState.isRecording}
      />

      {/* Add the DirectionArrow component */}
      <DirectionArrow
        targetDirection={targetDirection}
        userMovement={userMovement}
        isVisible={recordingState.isRecording}
      />

      {recordingState.isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>REC</Text>
        </View>
      )}

      <View style={styles.controls}>
        <RecordingButton
          isRecording={recordingState.isRecording}
          onPress={toggleRecording}
        />
      </View>

      {/* You can update this instruction text */}
      {recordingState.isRecording && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Follow the arrow's direction
          </Text>
        </View>
      )}
    </View>
  );
};

// --- Styles remain the same ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 45,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E53935',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
```

### Step 3: Repurpose `DirectionArrow.tsx`

Now, we'll update the `DirectionArrow.tsx` component to handle the new logic. It will now determine its color and rotation based on the props it receives from `CameraView.tsx`.

**File**: `components/DirectionArrow.tsx`

Replace the entire content of this file with the following code:

```typescript
import React from 'react';
import { StyleSheet, Animated, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ArrowProps } from '../types';

export const DirectionArrow: React.FC<ArrowProps> = ({
  targetDirection,
  userMovement,
  isVisible,
}) => {
  const colorAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const isMovingCorrectly =
    (targetDirection === 'right' && userMovement.isMovingRight) ||
    (targetDirection === 'left' && userMovement.isMovingLeft);

  React.useEffect(() => {
    let targetColorValue = 0; // Default color (e.g., blue)
    if (isMovingCorrectly) {
      targetColorValue = 1; // Correct movement (green)
    }

    Animated.timing(colorAnim, {
      toValue: targetColorValue,
      duration: 250,
      useNativeDriver: false, // backgroundColor cannot use native driver
    }).start();

    // Pulse animation for feedback
    if (userMovement.isMovingLeft || userMovement.isMovingRight) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [isMovingCorrectly, userMovement, colorAnim, scaleAnim]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2979FF', '#43A047'], // Blue -> Green
  });

  const rotation = targetDirection === 'left' ? '270deg' : '90deg';
  const iconName = targetDirection === 'left' ? 'arrow-back' : 'arrow-forward';

  if (!isVisible || !targetDirection) return null;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.arrowContainer, 
          { 
            backgroundColor,
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        <MaterialIcons name={iconName} size={48} color="white" />
      </Animated.View>
      <Text style={styles.statusText}>
        Tilt Your Phone to the {targetDirection.charAt(0).toUpperCase() + targetDirection.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    zIndex: 1000,
    alignItems: 'center',
  },
  arrowContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  statusText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
```

---

## Summary of Changes

-   **`types/index.ts`**: Added a `Direction` type and updated `ArrowProps` to be more specific to the new requirements.
-   **`components/CameraView.tsx`**: Now holds the state for the `targetDirection`. It randomly assigns a direction when recording starts and clears it on stop. It also contains the logic to trigger a vibration if the user moves in the opposite direction of the arrow.
-   **`components/DirectionArrow.tsx`**: This component has been completely repurposed to serve as the UI for the new feature. It takes the `targetDirection` and `userMovement` as props and updates its appearance (color and rotation) accordingly.

After making these changes, your app will have the desired functionality.
