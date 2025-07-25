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