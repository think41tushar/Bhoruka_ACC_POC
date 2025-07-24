import React from 'react';
import { StyleSheet, Animated, View, Text } from 'react-native';
import { MovementDisplayProps } from '../types';

export const MovementDisplay: React.FC<MovementDisplayProps> = ({
  userMovement,
  isVisible,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!isVisible) {
      fadeAnim.setValue(0);
      return;
    }

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Scale pulse when movement changes
    if (userMovement.isMovingRight || userMovement.isMovingLeft) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [userMovement.isMovingRight, userMovement.isMovingLeft, isVisible, fadeAnim, scaleAnim]);

  const getMovementText = (): string => {
    if (userMovement.isMovingRight) return 'Turn Right';
    if (userMovement.isMovingLeft) return 'Turn Left';
    return 'Move to see direction';
  };

  const getTextColor = (): string => {
    if (userMovement.isMovingRight) return '#43A047'; // Green
    if (userMovement.isMovingLeft) return '#E53935';  // Red
    return '#2979FF'; // Blue
  };

  const getBackgroundColor = (): string => {
    if (userMovement.isMovingRight) return 'rgba(67, 160, 71, 0.2)';
    if (userMovement.isMovingLeft) return 'rgba(229, 57, 53, 0.2)';
    return 'rgba(41, 121, 255, 0.2)';
  };

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          backgroundColor: getBackgroundColor(),
        }
      ]}
    >
      <Text style={[styles.movementText, { color: getTextColor() }]}>
        {getMovementText()}
      </Text>
      
      {/* Optional: Show movement status */}
      <Text style={styles.statusText}>
        {userMovement.isStationary ? 'Hold steady and move left or right' : 'Moving...'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1000,
  },
  movementText: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
});
