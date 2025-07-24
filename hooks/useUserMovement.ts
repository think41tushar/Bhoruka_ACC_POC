// import { useState, useEffect, useCallback, useRef } from 'react';
// import { Accelerometer } from 'expo-sensors';
// import { UserMovementState, AccelerometerData } from '../types';

// export const useUserMovement = (isActive: boolean): UserMovementState => {
//   const [movementState, setMovementState] = useState<UserMovementState>({
//     isMovingRight: false,
//     isMovingLeft: false,
//     isStationary: true,
//     accelerometerData: { x: 0, y: 0, z: 0, timestamp: 0 },
//   });

//   // Movement detection parameters
//   const UPDATE_INTERVAL = 100;           // 100ms updates for smooth detection
//   const MOVEMENT_THRESHOLD = 0.15;       // Threshold for detecting movement
//   const SMOOTHING_WINDOW = 5;            // Window for smoothing readings
//   const STATIONARY_THRESHOLD = 0.05;     // Threshold for being stationary

//   const xHistory = useRef<number[]>([]);
//   const baselineX = useRef<number>(0);
//   const calibrated = useRef<boolean>(false);
//   const calibrationCount = useRef<number>(0);

//   const handleAccelerometerUpdate = useCallback((data: AccelerometerData): void => {
//     // Calibration phase - establish baseline when user is stationary
//     if (!calibrated.current && calibrationCount.current < 20) {
//       baselineX.current += data.x;
//       calibrationCount.current++;
      
//       if (calibrationCount.current === 20) {
//         baselineX.current = baselineX.current / 20;
//         calibrated.current = true;
//         console.log('Movement baseline calibrated:', baselineX.current);
//       }
//       return;
//     }

//     // Calculate movement relative to baseline
//     const relativeX = data.x - baselineX.current;
    
//     // Add to history for smoothing
//     xHistory.current.push(relativeX);
//     if (xHistory.current.length > SMOOTHING_WINDOW) {
//       xHistory.current.shift();
//     }

//     // Calculate smoothed movement
//     const smoothedX = xHistory.current.reduce((sum, val) => sum + val, 0) / xHistory.current.length;

//     // Determine user movement direction from their perspective
//     const isMovingRight = smoothedX > MOVEMENT_THRESHOLD;   // Positive X = moving right
//     const isMovingLeft = smoothedX < -MOVEMENT_THRESHOLD;   // Negative X = moving left
//     const isStationary = Math.abs(smoothedX) <= STATIONARY_THRESHOLD;

//     // Debug logging
//     console.log('User Movement:', {
//       rawX: data.x.toFixed(3),
//       baseline: baselineX.current.toFixed(3),
//       relative: relativeX.toFixed(3),
//       smoothed: smoothedX.toFixed(3),
//       right: isMovingRight,
//       left: isMovingLeft,
//       stationary: isStationary
//     });

//     setMovementState({
//       isMovingRight,
//       isMovingLeft,
//       isStationary,
//       accelerometerData: data,
//     });
//   }, []);

//   useEffect(() => {
//     let subscription: { remove(): void } | null = null;

//     if (isActive) {
//       // Reset calibration when starting
//       xHistory.current = [];
//       baselineX.current = 0;
//       calibrationCount.current = 0;   
//       calibrated.current = false;
      
//       // Set update interval
//       Accelerometer.setUpdateInterval(UPDATE_INTERVAL);
      
//       // Subscribe to accelerometer updates
//       subscription = Accelerometer.addListener(handleAccelerometerUpdate);
      
//       console.log('Started user movement detection');
//     } else {
//       // Reset state when inactive
//       xHistory.current = [];
//       calibrated.current = false;
//       setMovementState({
//         isMovingRight: false,
//         isMovingLeft: false,
//         isStationary: true,
//         accelerometerData: { x: 0, y: 0, z: 0, timestamp: 0 },
//       });
      
//       console.log('Stopped user movement detection');
//     }

//     return () => {
//       if (subscription) {
//         subscription.remove();
//       }
//     };
//   }, [isActive, handleAccelerometerUpdate]);

//   return movementState;
// };


import { useState, useEffect, useCallback, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { UserMovementState, AccelerometerData } from '../types';

export const useUserMovement = (isActive: boolean): UserMovementState => {
  const [movementState, setMovementState] = useState<UserMovementState>({
    isMovingRight: false,
    isMovingLeft: false,
    isStationary: true,
    accelerometerData: { x: 0, y: 0, z: 0, timestamp: 0 },
  });

  // Movement detection parameters
  const UPDATE_INTERVAL = 100;           // 100ms updates for smooth detection
  const MOVEMENT_THRESHOLD = 0.15;       // Threshold for detecting movement
  const SMOOTHING_WINDOW = 5;            // Window for smoothing readings
  const STATIONARY_THRESHOLD = 0.05;     // Threshold for being stationary

  const xHistory = useRef<number[]>([]);
  const baselineX = useRef<number>(0);
  const calibrated = useRef<boolean>(false);
  const calibrationCount = useRef<number>(0);

  const handleAccelerometerUpdate = useCallback((data: AccelerometerData): void => {
    // Calibration phase - establish baseline when user is stationary
    if (!calibrated.current && calibrationCount.current < 20) {
      baselineX.current += data.x;
      calibrationCount.current++;
      
      if (calibrationCount.current === 20) {
        baselineX.current = baselineX.current / 20;
        calibrated.current = true;
        console.log('Movement baseline calibrated:', baselineX.current);
      }
      return;
    }

    // Calculate movement relative to baseline
    const relativeX = data.x - baselineX.current;
    
    // Add to history for smoothing
    xHistory.current.push(relativeX);
    if (xHistory.current.length > SMOOTHING_WINDOW) {
      xHistory.current.shift();
    }

    // Calculate smoothed movement
    const smoothedX = xHistory.current.reduce((sum, val) => sum + val, 0) / xHistory.current.length;

    // ✅ CORRECTED: Inverted logic to match real user movement
    // When user moves right, phone tilts right causing negative X reading
    // When user moves left, phone tilts left causing positive X reading
    const isMovingRight = smoothedX < -MOVEMENT_THRESHOLD;   // Negative X = moving right
    const isMovingLeft = smoothedX > MOVEMENT_THRESHOLD;     // Positive X = moving left
    const isStationary = Math.abs(smoothedX) <= STATIONARY_THRESHOLD;

    // Debug logging with corrected interpretation
    console.log('User Movement (CORRECTED):', {
      rawX: data.x.toFixed(3),
      baseline: baselineX.current.toFixed(3),
      relative: relativeX.toFixed(3),
      smoothed: smoothedX.toFixed(3),
      right: isMovingRight,
      left: isMovingLeft,
      stationary: isStationary,
      interpretation: smoothedX > MOVEMENT_THRESHOLD ? 'LEFT' : 
                     smoothedX < -MOVEMENT_THRESHOLD ? 'RIGHT' : 'STATIONARY'
    });

    setMovementState({
      isMovingRight,
      isMovingLeft,
      isStationary,
      accelerometerData: data,
    });
  }, []);

  useEffect(() => {
    let subscription: { remove(): void } | null = null;

    if (isActive) {
      // Reset calibration when starting
      xHistory.current = [];
      baselineX.current = 0;
      calibrationCount.current = 0;   
      calibrated.current = false;
      
      // Set update interval
      Accelerometer.setUpdateInterval(UPDATE_INTERVAL);
      
      // Subscribe to accelerometer updates
      subscription = Accelerometer.addListener(handleAccelerometerUpdate);
      
      console.log('Started user movement detection with corrected logic');
    } else {
      // Reset state when inactive
      xHistory.current = [];
      calibrated.current = false;
      setMovementState({
        isMovingRight: false,
        isMovingLeft: false,
        isStationary: true,
        accelerometerData: { x: 0, y: 0, z: 0, timestamp: 0 },
      });
      
      console.log('Stopped user movement detection');
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isActive, handleAccelerometerUpdate]);

  return movementState;
};
