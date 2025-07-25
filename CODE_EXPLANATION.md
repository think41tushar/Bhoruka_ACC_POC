# Code Structure and Flow Explanation

This document breaks down the architecture of the React Native camera application, explaining how the different parts of the code work together.

## 1. High-Level Overview

The application is a camera recorder that also tracks the user's physical movement (tilting the phone left or right). When recording starts, it prompts the user to move in a specific direction. It provides visual feedback on whether the user is moving correctly and vibrates if they move in the wrong direction.

The core logic is separated into **Hooks**, and the visual parts are handled by **Components**. The main screen assembles these pieces to create the final user experience.

## 2. Directory and File Structure

-   `/app`: Contains the main screen configuration.
    -   `_layout.tsx`: Defines the root navigation structure (a simple stack navigator).
    -   `index.tsx`: The main entry point and primary screen of the app.
-   `/components`: Reusable UI elements.
    -   `CameraView.tsx`: The main component that houses the camera feed and related UI.
    -   `RecordingButton.tsx`: The button to start and stop recording.
    -   `MovementDisplay.tsx`: A display that shows the user's current movement direction.
    -   `DirectionArrow.tsx`: An arrow that shows the *target* direction the user should move in.
-   `/hooks`: Reusable logic and state management.
    -   `usePermissions.ts`: Handles requesting and checking camera/microphone permissions.
    -   `useCamera.ts`: Manages all camera-related actions like starting/stopping recording.
    -   `useUserMovement.ts`: Uses the accelerometer to detect if the user is tilting the phone left or right.
-   `/types`: Contains TypeScript type definitions for data structures used across the app.

## 3. Core Logic: The Hooks

The application's "brain" resides in the custom hooks.

### `usePermissions.ts`
-   **Purpose**: To abstract away the logic of handling device permissions.
-   **How it works**: It uses `expo-camera` to check if the app has been granted access to the camera and microphone.
-   **Output**: It returns the permission status (`camera`, `microphone`) and a function (`requestPermissions`) to prompt the user for access.
-   **Called by**: `app/index.tsx`.

### `useCamera.ts`
-   **Purpose**: To manage the camera's state and recording functionality.
-   **How it works**: It maintains the recording state (`isRecording`, `videoUri`) and provides functions (`startRecording`, `stopRecording`, `toggleRecording`) to control the camera. It uses a `cameraRef` to interact with the underlying `ExpoCameraView` component.
-   **Output**: A `cameraRef` to be attached to the camera component, the current `recordingState`, and control functions.
-   **Called by**: `components/CameraView.tsx`.

### `useUserMovement.ts`
-   **Purpose**: To detect the user's lateral (left/right) movement by monitoring the device's accelerometer.
-   **How it works**:
    1.  It only runs when `isActive` is `true` (i.e., when recording is in progress).
    2.  It first calibrates by taking a few initial accelerometer readings to establish a "stationary" baseline.
    3.  It then continuously reads the accelerometer's `x`-axis data.
    4.  **Key Logic**: When the user tilts the phone to their **left**, the `x` value becomes positive. When they tilt to their **right**, the `x` value becomes negative.
    5.  It smooths the raw data to prevent jittery readings.
-   **Output**: An object indicating if the user `isMovingLeft`, `isMovingRight`, or is `isStationary`.
-   **Called by**: `components/CameraView.tsx`.

## 4. UI Layer: The Components

The components are responsible for what the user sees and interacts with.

### `app/index.tsx` (The Main Screen)
-   **Purpose**: Acts as the main container and orchestrator for the entire application.
-   **Flow**:
    1.  It first calls `usePermissions` to check for camera/microphone access.
    2.  If permissions are not granted, it displays a message asking the user to grant them.
    3.  If permissions are granted, it renders the `CameraView` component.
    4.  It receives the final recording state from `CameraView` (via the `onRecordingStateChange` callback) and shows an alert when a video is saved.

### `components/CameraView.tsx`
-   **Purpose**: The primary view that combines the camera feed, movement detection, and user controls.
-   **Flow**:
    1.  It calls `useCamera()` to get the camera controls and `useUserMovement()` to get movement data. The movement hook is only active when `recordingState.isRecording` is true.
    2.  It renders the `<ExpoCameraView>` from the `expo-camera` library.
    3.  When the user presses the `RecordingButton`, it calls `toggleRecording` from `useCamera`.
    4.  When recording starts, it sets a random `targetDirection` ('left' or 'right').
    5.  It passes the `targetDirection` and the live `userMovement` data to the `DirectionArrow` component.
    6.  It passes the `userMovement` data to the `MovementDisplay` component.
    7.  It constantly checks if the user is moving opposite to the `targetDirection`. If so, it triggers the device to **vibrate**.
    8.  It bubbles up the `recordingState` to `app/index.tsx`.

### `components/RecordingButton.tsx`
-   **Purpose**: A simple, stateful button for starting and stopping the recording.
-   **How it works**: It receives `isRecording` as a prop and changes its appearance (icon and color) and animation based on this state. It calls the `onPress` function passed to it from `CameraView`.

### `components/DirectionArrow.tsx`
-   **Purpose**: To visually guide the user.
-   **How it works**:
    1.  It's only visible during recording.
    2.  It displays an arrow pointing in the `targetDirection` ('left' or 'right').
    3.  It changes color to **green** if the user is moving in the correct direction and stays **blue** otherwise, providing instant visual feedback.

### `components/MovementDisplay.tsx`
-   **Purpose**: To show a textual representation of the user's current detected movement.
-   **How it works**: It's only visible during recording. It displays "Turn Left", "Turn Right", or "Move to see direction" based on the data from the `useUserMovement` hook.

## 5. User Interaction Flow (Step-by-Step)

1.  **App Launch**: The app starts on `app/index.tsx`.
2.  **Permission Request**: `usePermissions` runs. If needed, the user is prompted to grant camera/microphone access.
3.  **Idle State**: The user sees the camera preview. The `RecordingButton` shows a "videocam" icon.
4.  **Start Recording**:
    -   The user taps the `RecordingButton`.
    -   `CameraView`'s `toggleRecording` function is called.
    -   `useCamera`'s `startRecording` function is executed.
    -   `useUserMovement` becomes active and starts listening to the accelerometer.
    -   `CameraView` sets a random `targetDirection` (e.g., 'left').
    -   The `DirectionArrow` appears, pointing left.
    -   The `MovementDisplay` appears.
    -   The `RecordingButton` turns red and shows a "stop" icon.
5.  **User Moves**:
    -   The user tilts the phone to the **left** (correctly). The `DirectionArrow` turns green.
    -   The user tilts the phone to the **right** (incorrectly). The `DirectionArrow` stays blue, and the phone **vibrates**.
6.  **Stop Recording**:
    -   The user taps the `RecordingButton` again.
    -   `CameraView`'s `toggleRecording` function is called.
    -   `useCamera`'s `stopRecording` function is executed.
    -   The video is saved to the device.
    -   `useUserMovement` becomes inactive.
    -   The `DirectionArrow` and `MovementDisplay` disappear.
    -   `onRecordingStateChange` fires, and `app/index.tsx` shows an alert confirming the video was saved.
