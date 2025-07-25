import React from 'react';
import { StyleSheet, Animated, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ArrowProps } from '../types';

export const DirectionArrow: React.FC<ArrowProps> = ({
  targetDirection,
  userMovement,
  isVisible,
}) => {
  const colorAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const isMovingCorrectly =
    (targetDirection === 'right' && userMovement.isMovingRight) ||
    (targetDirection === 'left' && userMovement.isMovingLeft);

  React.useEffect(() => {
    let targetColorValue = 0; // Default color (e.g., blue)
    if (isMovingCorrectly) {
      targetColorValue = 1; // Correct movement (green)
    }

    Animated.timing(colorAnim, {
      toValue: targetColorValue,
      duration: 250,
      useNativeDriver: false, // backgroundColor cannot use native driver
    }).start();

    // Pulse animation for feedback
    if (userMovement.isMovingLeft || userMovement.isMovingRight) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [isMovingCorrectly, userMovement, colorAnim, scaleAnim]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2979FF', '#43A047'], // Blue -> Green
  });

  const rotation = targetDirection === 'left' ? '270deg' : '90deg';
  const iconName = targetDirection === 'left' ? 'arrow-back' : 'arrow-forward';

  if (!isVisible || !targetDirection) return null;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.arrowContainer, 
          { 
            backgroundColor,
          }
        ]}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <MaterialIcons name={iconName} size={48} color="white" />
        </Animated.View>
      </Animated.View>
      {/* <Text style={styles.statusText}>
        Tilt Your Phone to the {targetDirection.charAt(0).toUpperCase() + targetDirection.slice(1)}
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    zIndex: 1000,
    alignItems: 'center',
  },
  arrowContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  statusText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
