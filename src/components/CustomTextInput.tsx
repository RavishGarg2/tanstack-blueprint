import React, { useState, forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../assets/colors';
import { horizontalScale, moderateScale, verticalScale } from '../utils/utils';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

export interface CustomTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  isRequired?: boolean;
  error?: string | (string | undefined | null)[] | null | undefined | any;
  leftIcon?: any;
  leftIconColor?: string;
  leftIconSize?: number;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

export const CustomTextInput = forwardRef<any, CustomTextInputProps>(
  (
    {
      label,
      isRequired = false,
      error,
      leftIcon: LeftIconComponent,
      leftIconColor = colors.textMuted,
      leftIconSize = moderateScale(18),
      rightIcon,
      clearable = false,
      onClear,
      containerStyle,
      inputContainerStyle,
      style,
      labelStyle,
      errorStyle,
      value,
      onChangeText,
      onFocus,
      onBlur,
      placeholderTextColor = colors.textLabel,
      ...restProps
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const errorMessage = Array.isArray(error)
      ? error.filter(Boolean).join(', ')
      : typeof error === 'string'
        ? error
        : '';
    const hasError = Boolean(errorMessage && errorMessage.length > 0);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (onChangeText) {
        onChangeText('');
      }
    };

    const showClearButton =
      clearable && Boolean(value && value.toString().length > 0);

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? (
          <Text style={[styles.label, labelStyle]}>
            {label}
            {isRequired && <Text style={styles.requiredAsterisk}> *</Text>}
          </Text>
        ) : null}

        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
            hasError && styles.inputWrapperError,
            inputContainerStyle,
          ]}
        >
          {LeftIconComponent ? (
            <View style={styles.leftIconContainer}>
              {React.isValidElement(LeftIconComponent) ? (
                LeftIconComponent
              ) : (
                <HugeiconsIcon
                  icon={LeftIconComponent}
                  size={leftIconSize}
                  color={isFocused ? colors.snapchatYellow : leftIconColor}
                />
              )}
            </View>
          ) : null}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              LeftIconComponent ? styles.inputWithLeftIcon : null,
              (showClearButton || rightIcon) ? styles.inputWithRightIcon : null,
              style,
            ]}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={placeholderTextColor}
            {...restProps}
          />

          {showClearButton ? (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={moderateScale(16)}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ) : rightIcon ? (
            <View style={styles.rightIconContainer}>{rightIcon}</View>
          ) : null}
        </View>

        {hasError ? (
          <Text style={[styles.errorText, errorStyle]}>{errorMessage}</Text>
        ) : null}
      </View>
    );
  },
);

CustomTextInput.displayName = 'CustomTextInput';

export default CustomTextInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(14),
  },
  label: {
    color: colors.textLabel,
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginBottom: verticalScale(6),
    letterSpacing: 0.2,
  },
  requiredAsterisk: {
    color: colors.errorRed,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.whiteTransparent5,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.whiteTransparent10,
    paddingHorizontal: horizontalScale(14),
  },
  inputWrapperFocused: {
    borderColor: colors.yellowTransparent40,
    backgroundColor: colors.yellowTransparent8,
  },
  inputWrapperError: {
    borderColor: colors.errorRed,
  },
  leftIconContainer: {
    marginRight: horizontalScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    marginLeft: horizontalScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: moderateScale(14),
    paddingVertical: verticalScale(12),
    paddingHorizontal: 0,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: horizontalScale(6),
  },
  clearButton: {
    padding: moderateScale(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.errorRed,
    fontSize: moderateScale(11),
    marginTop: verticalScale(4),
    marginLeft: horizontalScale(4),
  },
});
