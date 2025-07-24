# Project Explanation

This document provides a detailed explanation of the project, its components, their connections, and the logic behind the accelerometer-based movement detection.

## Project Structure

The project is structured as follows:

-   **/app**: Contains the main application screens.
    -   `_layout.tsx`: Defines the root layout of the app using `expo-router`.
    -   `index.tsx`: The main entry point of the app.
-   **/assets**: Contains static assets like fonts and images.
-   **/components**: Contains reusable React components.
    -   `CameraView.tsx`: The main component that combines the camera, movement display, and recording controls.
    -   `MovementDisplay.tsx`: Displays the user's movement direction.
    -   `RecordingButton.tsx`: The button to start and stop recording.
    -   `DirectionArrow.tsx`: **(Unused)** A component that was likely used in a previous version to show a directional arrow.
-   **/hooks**: Contains custom React hooks for managing logic and state.
    -   `useCamera.ts`: Manages the camera state (recording, etc.).
    -   `usePermissions.ts`: Handles camera and microphone permissions.
    -   `useUserMovement.ts`: Detects user movement using the accelerometer.
    -   `useSensorMovement.ts`: **(Unused)** A hook that was likely used in a previous version to detect movement using the gyroscope.
-   **/types**: Contains TypeScript type definitions.
    -   `index.ts`: Defines all the custom types used in the application.

## Component Connections

The components are connected in the following way:

1.  **`app/index.tsx`**:
    -   This is the root component of the application.
    -   It uses the `usePermissions` hook to check for camera and microphone permissions.
    -   If permissions are granted, it renders the `CameraView` component.
    -   If permissions are not granted, it displays an alert to the user.

2.  **`components/CameraView.tsx`**:
    -   This component is the core of the user interface.
    -   It uses the `useCamera` hook to manage the camera's state (e.g., `isRecording`).
    -   It uses the `useUserMovement` hook to get the user's movement data (`isMovingLeft`, `isMovingRight`).
    -   It renders the `ExpoCameraView` component to display the camera feed.
    -   It renders the `MovementDisplay` component, passing the `userMovement` data to it.
    -   It renders the `RecordingButton` component, passing the `isRecording` state and the `toggleRecording` function to it.

3.  **`components/MovementDisplay.tsx`**:
    -   This component is responsible for displaying the user's movement direction.
    -   It receives the `userMovement` state from `CameraView.tsx`.
    -   Based on the `isMovingLeft` and `isMovingRight` booleans, it displays "Turn Left", "Turn Right", or "Move to see direction".

4.  **`components/RecordingButton.tsx`**:
    -   This is a simple button that allows the user to start and stop recording.
    -   It receives the `isRecording` state from `CameraView.tsx` to determine its appearance (e.g., "Start Recording" or "Stop Recording").
    -   When pressed, it calls the `toggleRecording` function from the `useCamera` hook.

## Unused Components and Hooks

-   **`components/DirectionArrow.tsx`**: This component is not imported or used anywhere in the current application. It was likely part of a previous implementation and has been replaced by `MovementDisplay.tsx`.
-   **`hooks/useSensorMovement.ts`**: This hook is also not used anywhere. It uses the `Gyroscope` to detect movement, but the application currently uses the `Accelerometer` via the `useUserMovement` hook.

## Accelerometer Logic

The accelerometer logic is handled in the `hooks/useUserMovement.ts` hook. Here's how it works:

1.  **Calibration**: When the recording starts, the hook first calibrates the accelerometer. It takes a few initial readings to determine the baseline orientation of the phone. This is important because the user might not be holding the phone perfectly level.

2.  **Smoothing**: To avoid jerky and inaccurate readings, the hook uses a smoothing algorithm. It keeps a history of the last few accelerometer readings and calculates an average. This helps to filter out small, insignificant movements.

3.  **Movement Detection**: After calibration and smoothing, the hook determines the direction of movement by looking at the `x` value of the accelerometer data. The logic has been corrected to accurately reflect the phone's movement:
    -   **When you tilt the phone to the RIGHT, the accelerometer's `x` value becomes NEGATIVE.**
    -   **When you tilt the phone to the LEFT, the accelerometer's `x` value becomes POSITIVE.**

    The code now correctly implements this:
    ```typescript
    const isMovingRight = smoothedX < -MOVEMENT_THRESHOLD;   // Negative X means moving right
    const isMovingLeft = smoothedX > MOVEMENT_THRESHOLD;    // Positive X means moving left
    ```
