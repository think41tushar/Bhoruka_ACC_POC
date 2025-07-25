# Feature Modification Plan: Up/Down Movement & Modal Feedback

This document outlines the plan to modify the existing camera feature. It first analyzes the current implementation and then provides a step-by-step guide for implementing vertical (up/down) movement detection and adding a modal for incorrect movement feedback.

## 1. Analysis of Current Implementation

After reviewing the code, here is a summary of the current movement detection functionality:

-   **Detection is only Horizontal**: The `useUserMovement` hook only analyzes the accelerometer's **`x`-axis** data. This means it can only detect if the user is tilting the phone left or right.
-   **Vertical Movement is Ignored**: There is no logic to detect, process, or penalize movement along the **`y`-axis** (up or down).
-   **Vibration is for Opposite Movement**: The `CameraView` component triggers a vibration *only* if the user moves in the exact opposite horizontal direction of the target (e.g., moves right when the target is left).

**Conclusion**: The requested feature to detect and penalize up/down movement is **not currently implemented**. The feedback for incorrect movement is limited to vibration only.

## 2. Proposed Feature: Enhanced Movement and Feedback

The goal is to enhance the app in two ways:
1.  **Four-Direction Movement**: Enhance the `useUserMovement` hook to detect vertical movement and update the `CameraView` logic to guide the user in one of four directions (up, down, left, or right).
2.  **Modal Feedback**: When the user moves in an incorrect direction, the app will provide feedback by **both vibrating and displaying a temporary modal** with a "Wrong Direction" message.

## 3. Step-by-Step Implementation Plan

The implementation will be broken down into the following file-by-file changes:

### Step 1: Update Type Definitions (`types/index.ts`)

First, we need to expand our type definitions to support the new movement states and directions.

-   **`UserMovementState`**: Add `isMovingUp` and `isMovingDown` properties.
-   **`Direction`**: Add `'up'` and `'down'` to the possible values.

```typescript
// types/index.ts

// ... other interfaces

export interface UserMovementState {
  isMovingRight: boolean;
  isMovingLeft: boolean;
  isMovingUp: boolean;   // ADD THIS
  isMovingDown: boolean;  // ADD THIS
  isStationary: boolean;
  accelerometerData: AccelerometerData;
}

// ... other interfaces

export type Direction = 'left' | 'right' | 'up' | 'down' | null; // ADD 'up' and 'down'
```

### Step 2: Enhance the Movement Hook (`hooks/useUserMovement.ts`)

Next, we'll update the core movement detection logic to process y-axis data from the accelerometer.

-   **Add `y`-axis processing**: Similar to how `x`-axis data is tracked, we will add logic to calibrate, smooth, and interpret `y`-axis data.
    -   Tilting the phone **up** (away from the user) typically results in a **positive `y`** value.
    -   Tilting the phone **down** (towards the user) typically results in a **negative `y`** value.
-   **Update State**: The hook will now set `isMovingUp` and `isMovingDown` in its state, which will be returned to any component that uses it.

### Step 3: Update the Main View (`components/CameraView.tsx`)

This component will be updated to handle the new four-direction logic and the feedback modal.

-   **Add Modal State**: Introduce a new state variable to control the visibility of the "Wrong Direction" modal.
    ```javascript
    const [isModalVisible, setModalVisible] = React.useState(false);
    ```
-   **Update `toggleRecording`**: When starting a recording, the `targetDirection` will now be randomly selected from one of four options: `'left'`, `'right'`, `'up'`, or `'down'`.
-   **Expand Feedback Logic**: The `useEffect` hook that handles feedback will be updated. It will now trigger both vibration and the modal.
    ```javascript
    // components/CameraView.tsx -> useEffect for feedback

    React.useEffect(() => {
      if (!recordingState.isRecording || !targetDirection || userMovement.isStationary) return;

      const isMovingIncorrectly = 
        (targetDirection === 'left' && (userMovement.isMovingRight || userMovement.isMovingUp || userMovement.isMovingDown)) ||
        (targetDirection === 'right' && (userMovement.isMovingLeft || userMovement.isMovingUp || userMovement.isMovingDown)) ||
        (targetDirection === 'up' && (userMovement.isMovingDown || userMovement.isMovingLeft || userMovement.isMovingRight)) ||
        (targetDirection === 'down' && (userMovement.isMovingUp || userMovement.isMovingLeft || userMovement.isMovingRight));

      if (isMovingIncorrectly) {
        Vibration.vibrate(100);
        setModalVisible(true); // Show the modal

        // Hide the modal after a short duration
        const timer = setTimeout(() => setModalVisible(false), 1500);
        return () => clearTimeout(timer);
      }
    }, [userMovement, targetDirection, recordingState.isRecording]);
    ```
-   **Add Modal Component**: Add the React Native `Modal` component to the JSX, controlled by the `isModalVisible` state. This modal will be styled to be a simple, clear overlay.

### Step 4: Update the Directional Arrow (`components/DirectionArrow.tsx`)

Finally, the arrow component needs to be able to point up and down.

-   **Update Rotation and Icon**: The logic that determines the arrow's rotation and icon will be expanded to handle `'up'` and `'down'`.
    -   `'up'`: `rotation: '0deg'`, `icon: 'arrow-upward'`
    -   `'down'`: `rotation: '180deg'`, `icon: 'arrow-downward'`
    -   `'left'`: `rotation: '270deg'`, `icon: 'arrow-back'`
    -   `'right'`: `rotation: '90deg'`, `icon: 'arrow-forward'`

## 4. Potential Future Enhancements

Once this four-way movement feature is implemented, we can consider several further improvements:

-   **Diagonal Directions**: Combine `x` and `y` data to introduce diagonal targets (e.g., "up-right").
-   **Movement Sensitivity**: Add a settings option to let the user adjust the `MOVEMENT_THRESHOLD`, making the detection more or less sensitive.
-   **Scoring System**: Instead of just vibrating, award points for how long the user stays in the correct direction and deduct points for incorrect movements.
-   **Enhanced Visual Feedback**: When the user moves incorrectly, flash the border of the screen red to provide more explicit visual feedback in addition to the vibration and modal.
-   **Gamification**: Introduce levels of increasing difficulty, where the direction changes more frequently or a sequence of movements must be completed.