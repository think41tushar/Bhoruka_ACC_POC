import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { PermissionState } from '../types';

export const usePermissions = (): PermissionState & { requestPermissions: () => Promise<boolean> } => {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: false,
    microphone: false,
    isLoading: true,
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async (): Promise<void> => {
    try {
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      const microphoneStatus = await Camera.getMicrophonePermissionsAsync();

      setPermissions({
        camera: cameraStatus.status === 'granted',
        microphone: microphoneStatus.status === 'granted',
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissions(prev => ({ ...prev, isLoading: false }));
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const cameraResult = await Camera.requestCameraPermissionsAsync();
      const microphoneResult = await Camera.requestMicrophonePermissionsAsync();

      const granted = cameraResult.status === 'granted' && microphoneResult.status === 'granted';

      setPermissions({
        camera: cameraResult.status === 'granted',
        microphone: microphoneResult.status === 'granted',
        isLoading: false,
      });

      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  return {
    ...permissions,
    requestPermissions,
  };
};
