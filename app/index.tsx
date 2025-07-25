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