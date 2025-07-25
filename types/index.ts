import { CameraType, CameraView } from 'expo-camera';

export interface CameraRef extends CameraView {
  recordAsync: (options?: any) => Promise<any>;
  stopRecording: () => void;
}

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface UserMovementState {
  isMovingRight: boolean;
  isMovingLeft: boolean;
  isStationary: boolean;
  accelerometerData: AccelerometerData;
}

export interface PermissionState {
  camera: boolean;
  microphone: boolean;
  isLoading: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  videoUri?: string;
  duration: number;
}

export interface MovementDisplayProps {
  userMovement: UserMovementState;
  isVisible: boolean;
}

export interface CameraViewProps {
  onRecordingStateChange: (state: RecordingState) => void;
}

export type Direction = 'left' | 'right' | null;

export interface ArrowProps {
  targetDirection: Direction;
  userMovement: UserMovementState;
  isVisible: boolean;
}