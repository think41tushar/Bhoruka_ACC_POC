// import React from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   Platform,
//   StatusBar,
//   ActivityIndicator,
// } from 'react-native';
// import { Camera, CameraView } from 'expo-camera';
// import { Accelerometer } from 'expo-sensors';
// import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
// import { Ionicons } from '@expo/vector-icons';


// // --- Constants ---
// const VIDEO_MAX_DURATION_MS = 60 * 1000;
// const ACCELEROMETER_UPDATE_MS = 400; // How often to check the sensor
// const MOVEMENT_THRESHOLD = 0.7; // How much tilt is needed to register movement
// const DIRECTIONS = ['up', 'down', 'left', 'right'];

// // --- UI Components ---

// /**
//  * An overlay that shows an arrow pointing in a target direction.
//  * The arrow is green when tilting towards the target and red otherwise.
//  */
// const MovementArrowOverlay = ({
//   arrowDirection,
//   arrowColor,
// }) => {
//   if (!arrowDirection) {
//     return null; // Render nothing if recording is not active
//   }

//   const getArrowRotation = () => {
//     switch (arrowDirection) {
//       case 'up': return '0deg';
//       case 'right': return '90deg';
//       case 'down': return '180deg';
//       case 'left': return '270deg';
//       default: return '0deg';
//     }
//   };

//   return (
//     <View style={styles.targetContainer}>
//       <Text style={styles.targetLabel}>Tilt Phone: {arrowDirection.toUpperCase()}</Text>
//       <View style={styles.arrowContainer}>
//         <Ionicons
//             name="arrow-up-circle"
//             size={80}
//             color={arrowColor}
//             style={{
//               transform: [{ rotate: getArrowRotation() }],
//               opacity: 0.9,
//             }}
//           />
//       </View>
//     </View>
//   );
// };

// // --- Main App Component ---
// export default function App() {
//   const [hasCameraPermission, setHasCameraPermission] = React.useState(null);
//   const [hasAudioPermission, setHasAudioPermission] = React.useState(null);
//   const cameraRef = React.useRef(null);
//   const [isRecording, setIsRecording] = React.useState(false);
//   const recordingTimer = React.useRef(null);

//   // --- State for movement detection ---
//   const [arrowDirection, setArrowDirection] = React.useState(null);
//   const [arrowColor, setArrowColor] = React.useState('#ff4757'); // Default red
//   const [accelerometerData, setAccelerometerData] = React.useState({ x: 0, y: 0, z: 0 });

//   // --- Effects ---

//   // 1. Permissions and screen awake effects
//   React.useEffect(() => {
//     (async () => {
//       const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
//       setHasCameraPermission(camStatus === 'granted');
//       const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
//       setHasAudioPermission(micStatus === 'granted');
//     })();
//   }, []);

//   React.useEffect(() => {
//     isRecording ? activateKeepAwake() : deactivateKeepAwake();
//   }, [isRecording]);

//   // 2. Accelerometer subscription
//   React.useEffect(() => {
//     Accelerometer.setUpdateInterval(ACCELEROMETER_UPDATE_MS);
//     const subscription = Accelerometer.addListener(setAccelerometerData);
//     return () => subscription?.remove();
//   }, []);

//   // 3. Effect for detecting movement direction
//   React.useEffect(() => {
//     if (!isRecording || !arrowDirection) return;

//     const { x, y } = accelerometerData;
//     let detectedMovement = null;

//     // Determine the dominant direction of tilt
//     if (y > MOVEMENT_THRESHOLD) detectedMovement = 'down';
//     else if (y < -MOVEMENT_THRESHOLD) detectedMovement = 'up';
//     else if (x > MOVEMENT_THRESHOLD) detectedMovement = 'right';
//     else if (x < -MOVEMENT_THRESHOLD) detectedMovement = 'left';

//     // Set color to green if tilt matches the arrow's direction
//     if (detectedMovement === arrowDirection) {
//       setArrowColor('#2ed573');
//     } else {
//       setArrowColor('#ff4757');
//     }
//   }, [accelerometerData, isRecording, arrowDirection]);

//   // --- Handlers ---

//   const handleStartRecording = async () => {
//     if (!cameraRef.current || isRecording) return;

//     // Choose a random direction on record start
//     const randomDirection = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
//     setArrowDirection(randomDirection);
//     setArrowColor('#ff4757'); // Reset color to red

//     try {
//       setIsRecording(true);
//       if (cameraRef.current) {
//         cameraRef.current.recordAsync({ maxDuration: VIDEO_MAX_DURATION_MS / 1000 });
//         recordingTimer.current = setTimeout(handleStopRecording, VIDEO_MAX_DURATION_MS);
//       }
//     } catch (error) {
//       console.error('Error starting recording:', error);
//       setIsRecording(false);
//     }
//   };

//   const handleStopRecording = () => {
//     if (cameraRef.current && isRecording) {
//       cameraRef.current.stopRecording();
//     }
//     setIsRecording(false);
//     setArrowDirection(null); // Hide the arrow
//     if (recordingTimer.current) {
//       clearTimeout(recordingTimer.current);
//       recordingTimer.current = null;
//     }
//   };

//   // --- Render Logic ---

//   if (hasCameraPermission === null || hasAudioPermission === null) {
//     return <View style={styles.centered}><ActivityIndicator size="large" color="#fff" /></View>;
//   }

//   if (!hasCameraPermission || !hasAudioPermission) {
//     return <View style={styles.centered}><Text style={styles.permissionText}>Camera & Audio Permissions Required.</Text></View>;
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar hidden />
//       <CameraView style={styles.camera} facing="back" ref={cameraRef}>
//         <MovementArrowOverlay
//           arrowDirection={arrowDirection}
//           arrowColor={arrowColor}
//         />
//         <View style={styles.controlsContainer}>
//           <TouchableOpacity
//             style={[styles.recordButton, isRecording ? styles.buttonStop : styles.buttonRec]}
//             onPress={isRecording ? handleStopRecording : handleStartRecording}
//           >
//             <Text style={styles.buttonLabel}>{isRecording ? 'STOP' : 'REC'}</Text>
//           </TouchableOpacity>
//         </View>
//       </CameraView>
//     </View>
//   );
// }

// // --- Styles ---

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#000' },
//   camera: { flex: 1 },
//   centered: { flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
//   permissionText: { color: '#ff4757', fontWeight: 'bold', fontSize: 18, textAlign: 'center', padding: 20 },
//   targetContainer: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 60 : 40,
//     width: '90%',
//     alignSelf: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(20,20,20,0.7)',
//     borderRadius: 20,
//     padding: 15,
//   },
//   targetLabel: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: 'bold',
//     letterSpacing: 1,
//   },
//   arrowContainer: {
//     marginVertical: 5,
//     width: 80,
//     height: 80,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   controlsContainer: {
//     position: 'absolute',
//     bottom: 48,
//     width: '100%',
//     alignItems: 'center',
//   },
//   recordButton: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     borderWidth: 6,
//     borderColor: '#333',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonRec: { backgroundColor: '#2ed573' },
//   buttonStop: { backgroundColor: '#ff4757' },
//   buttonLabel: { color: '#fff', fontWeight: '700', fontSize: 22 },
// });



// import React from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   Platform,
//   StatusBar,
//   ActivityIndicator,
// } from 'react-native';
// import { Camera } from 'expo-camera';
// import { Accelerometer } from 'expo-sensors';
// import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
// import { Ionicons } from '@expo/vector-icons';

// // --- Constants ---
// const VIDEO_MAX_DURATION_MS = 60 * 1000;
// const ACCELEROMETER_UPDATE_MS = 200; // Update interval for accelerometer
// const MOVEMENT_THRESHOLD = 0.7; // Threshold for detecting right tilt

// // --- Arrow direction is fixed to 'right' as per requirement ---
// const ARROW_DIRECTION = 'right';

// // --- Main App Component ---
// export default function App() {
//   const [hasCameraPermission, setHasCameraPermission] = React.useState(null);
//   const [hasAudioPermission, setHasAudioPermission] = React.useState(null);
//   const cameraRef = React.useRef(null);
//   const [isRecording, setIsRecording] = React.useState(false);
//   const [recordingCount, setRecordingCount] = React.useState(0);
//   const recordingTimer = React.useRef(null);

//   // Accelerometer data
//   const [accelerometerData, setAccelerometerData] = React.useState({ x: 0, y: 0, z: 0 });

//   // Arrow color state: green if tilt right, red otherwise
//   const [arrowColor, setArrowColor] = React.useState('#ff4757'); // default red

//   // Request permissions on mount
//   React.useEffect(() => {
//     (async () => {
//       const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
//       setHasCameraPermission(camStatus === 'granted');
//       const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
//       setHasAudioPermission(micStatus === 'granted');
//     })();
//   }, []);

//   // Manage screen awake based on recording state
//   React.useEffect(() => {
//     if (isRecording) activateKeepAwake();
//     else deactivateKeepAwake();
//   }, [isRecording]);

//   // Subscribe to accelerometer
//   React.useEffect(() => {
//     Accelerometer.setUpdateInterval(ACCELEROMETER_UPDATE_MS);
//     const subscription = Accelerometer.addListener((data) => {
//       setAccelerometerData(data);
//     });
//     return () => subscription?.remove();
//   }, []);

//   // Update arrow color based on accelerometer X axis when recording
//   React.useEffect(() => {
//     if (!isRecording) {
//       setArrowColor('#ff4757'); // red
//       return;
//     }
//     const { x } = accelerometerData;
//     if (x > MOVEMENT_THRESHOLD) {
//       setArrowColor('#2ed573'); // green - moving right
//     } else {
//       setArrowColor('#ff4757'); // red - not moving right enough
//     }
//   }, [accelerometerData, isRecording]);

//   // Start recording handler
//   const handleStartRecording = async () => {
//     if (!cameraRef.current || isRecording) return;

//     try {
//       setIsRecording(true);
//       setRecordingCount((c) => c + 1);
//       // recordAsync returns a promise that resolves with the recorded data
//       await cameraRef.current.recordAsync({
//         maxDuration: VIDEO_MAX_DURATION_MS / 1000,
//         mute: false,
//       });
//       // After recording completes naturally (maxDuration), stop state update
//       setIsRecording(false);
//     } catch (error) {
//       console.error('Error starting recording:', error);
//       setIsRecording(false);
//     }
//   };

//   // Stop recording handler
//   const handleStopRecording = () => {
//     if (cameraRef.current && isRecording) {
//       cameraRef.current.stopRecording();
//       setIsRecording(false);
//     }
//   };

//   // Permission loading state
//   if (hasCameraPermission === null || hasAudioPermission === null) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#fff" />
//       </View>
//     );
//   }

//   if (!hasCameraPermission || !hasAudioPermission) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.permissionText}>Camera & Audio Permissions Required.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar hidden />
//       <Camera style={styles.camera} type={Camera.Constants.Type.back} ref={cameraRef}>
//         {/* Recording count overlay */}
//         <View style={styles.countOverlay}>
//           <Text style={styles.countText}>Recordings Started: {recordingCount}</Text>
//         </View>

//         {/* Arrow overlay */}
//         {isRecording && (
//           <View style={styles.arrowOverlay}>
//             <Ionicons
//               name="arrow-forward-circle"
//               size={80}
//               color={arrowColor}
//               style={{ opacity: 0.9 }}
//             />
//           </View>
//         )}

//         {/* Controls */}
//         <View style={styles.controlsContainer}>
//           <TouchableOpacity
//             onPress={isRecording ? handleStopRecording : handleStartRecording}
//             style={[styles.recordButton, isRecording ? styles.buttonStop : styles.buttonRec]}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.buttonLabel}>{isRecording ? 'STOP' : 'REC'}</Text>
//           </TouchableOpacity>
//         </View>
//       </Camera>
//     </View>
//   );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#000' },
//   camera: { flex: 1 },
//   centered: {
//     flex: 1,
//     backgroundColor: '#111',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   permissionText: {
//     color: '#ff4757',
//     fontWeight: 'bold',
//     fontSize: 18,
//     textAlign: 'center',
//     padding: 20,
//   },

//   countOverlay: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 60 : 40,
//     left: 20,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     zIndex: 10,
//   },
//   countText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },

//   arrowOverlay: {
//     position: 'absolute',
//     bottom: 150,
//     right: 40,
//     zIndex: 10,
//   },

//   controlsContainer: {
//     position: 'absolute',
//     bottom: 48,
//     width: '100%',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   recordButton: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     borderWidth: 6,
//     borderColor: '#333',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonRec: { backgroundColor: '#2ed573' },
//   buttonStop: { backgroundColor: '#ff4757' },
//   buttonLabel: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 22,
//   },
// });


import React from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView } from '../components/CameraView';
import { usePermissions } from '../hooks/usePermissions';
import { RecordingState } from '../types';

export default function App(): JSX.Element {
  const { camera, microphone, isLoading, requestPermissions } = usePermissions();
  const [recordingState, setRecordingState] = React.useState<RecordingState>({
    isRecording: false,
    duration: 0,
  });

  React.useEffect(() => {
    if (!isLoading && (!camera || !microphone)) {
      Alert.alert(
        'Permissions Required',
        'This app needs camera and microphone permissions to detect movement and record videos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Grant Permissions', 
            onPress: async () => {
              const granted = await requestPermissions();
              if (!granted) {
                Alert.alert('Error', 'Camera and microphone permissions are required to use this app.');
              }
            }
          }
        ]
      );
    }
  }, [camera, microphone, isLoading, requestPermissions]);

  const handleRecordingStateChange = React.useCallback((state: RecordingState): void => {
    setRecordingState(state);
    
    // Handle completed recording
    if (state.videoUri && !state.isRecording) {
      console.log('Video recorded successfully:', state.videoUri);
      Alert.alert(
        'Recording Complete', 
        `Video saved! Duration: ${state.duration}s`,
        [{ text: 'OK' }]
      );
    }
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  if (!camera || !microphone) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Permissions Required</Text>
        <Text style={styles.permissionText}>
          This app needs camera and microphone access to record videos and detect your movement.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView onRecordingStateChange={handleRecordingStateChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#000',
  },
  permissionTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
});
