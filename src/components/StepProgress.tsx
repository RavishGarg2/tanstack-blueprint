import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { colors } from '../assets/colors';
import { horizontalScale, moderateScale, verticalScale } from '../utils/utils';

interface StepProgressProps {
  currentStep: number;
  steps: readonly string[];
  onStepPress?: (step: number) => void;
}

export default function StepProgress({
  currentStep,
  steps,
  onStepPress,
}: StepProgressProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: (currentStep + 1) / steps.length,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    animation.start();
    return () => animation.stop();
  }, [currentStep, progress, steps.length]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.kicker}>PROFILE SETUP</Text>
        <Text style={styles.counter}>
          STEP {currentStep + 1} OF {steps.length}
        </Text>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
      </View>

      <View style={styles.stepsRow}>
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const canPress = Boolean(onStepPress) && isCompleted;

          return (
            <TouchableOpacity
              key={`${label}-${index}`}
              style={styles.step}
              onPress={() => onStepPress?.(index)}
              disabled={!canPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Step ${index + 1}: ${label}`}
              accessibilityState={{
                selected: isActive,
                disabled: !canPress,
              }}
            >
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isActive && styles.dotActive,
                ]}
              >
                {isCompleted ? (
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    size={moderateScale(11)}
                    color={colors.snapchatYellow}
                  />
                ) : (
                  <Text
                    style={[styles.dotText, isActive && styles.dotTextActive]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              <Text
                numberOfLines={1}
                style={[
                  styles.stepLabel,
                  isCompleted && styles.stepLabelCompleted,
                  isActive && styles.stepLabelActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(2),
    paddingBottom: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteTransparent8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  kicker: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  counter: {
    color: colors.textSubMuted,
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  track: {
    height: verticalScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: colors.whiteTransparent8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: moderateScale(2),
    backgroundColor: colors.snapchatYellow,
    shadowColor: colors.snapchatYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: verticalScale(12),
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  dot: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.whiteTransparent5,
    borderWidth: 1,
    borderColor: colors.whiteTransparent10,
  },
  dotCompleted: {
    backgroundColor: colors.yellowTransparent15,
    borderColor: colors.yellowTransparent40,
  },
  dotActive: {
    backgroundColor: colors.snapchatYellow,
    borderColor: colors.snapchatYellow,
    shadowColor: colors.snapchatYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 5,
  },
  dotText: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  dotTextActive: {
    color: colors.black,
  },
  stepLabel: {
    color: colors.textLabel,
    fontSize: moderateScale(10),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: verticalScale(6),
    letterSpacing: 0.1,
  },
  stepLabelCompleted: {
    color: colors.textSecondary,
  },
  stepLabelActive: {
    color: colors.white,
    fontWeight: '700',
  },
});
