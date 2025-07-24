import { useState, useRef, useCallback } from 'react';
import { CameraView } from 'expo-camera';
import { RecordingState, CameraRef } from '../types';

export const useCamera = () => {
  const cameraRef = useRef<CameraRef>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
  });

  const startRecording = useCallback(async (): Promise<void> => {
    if (!cameraRef.current || recordingState.isRecording) return;

    try {
      console.log('Starting camera recording...');
      setRecordingState(prev => ({ ...prev, isRecording: true }));
      
      const result = await cameraRef.current.recordAsync({
        quality: '720p',
        maxDuration: 60, // 60 seconds max
        mute: false,
      });

      console.log('Recording completed:', result.uri);
      setRecordingState(prev => ({
        ...prev,
        videoUri: result.uri,
        isRecording: false,
      }));
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingState(prev => ({ ...prev, isRecording: false }));
    }
  }, [recordingState.isRecording]);

  const stopRecording = useCallback((): void => {
    if (!cameraRef.current || !recordingState.isRecording) return;

    try {
      console.log('Stopping camera recording...');
      cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }, [recordingState.isRecording]);

  const toggleRecording = useCallback((): void => {
    if (recordingState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [recordingState.isRecording, startRecording, stopRecording]);

  return {
    cameraRef,
    recordingState,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
