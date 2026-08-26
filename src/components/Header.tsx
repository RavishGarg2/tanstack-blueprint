import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../assets/colors';
import { horizontalScale, moderateScale, verticalScale } from '../utils/utils';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import CustomTextInput, { CustomTextInputProps } from './CustomTextInput';

export interface HeaderIconButtonProps {
  icon: any;
  onPress: () => void;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
}

export const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({
  icon,
  onPress,
  color = colors.snapchatYellow,
  size = moderateScale(20),
  style,
  activeOpacity = 0.7,
}) => (
  <TouchableOpacity
    style={[styles.actionIconButton, style]}
    onPress={onPress}
    activeOpacity={activeOpacity}
  >
    <HugeiconsIcon icon={icon} size={size} color={color} />
  </TouchableOpacity>
);

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightActions?: React.ReactNode;
  titleAlign?: 'center' | 'left';
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  hasBottomBorder?: boolean;
  children?: React.ReactNode;
  searchProps?: CustomTextInputProps;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  rightActions,
  titleAlign,
  containerStyle,
  titleStyle,
  subtitleStyle,
  hasBottomBorder,
  children,
  searchProps,
}) => {
  // If searchProps or children is provided, render Search/Custom Content Header
  if (searchProps || children) {
    const hasBorder = hasBottomBorder !== undefined ? hasBottomBorder : true;
    return (
      <View
        style={[
          styles.headerContainer,
          styles.searchHeaderContainer,
          hasBorder && styles.bottomBorder,
          containerStyle,
        ]}
      >
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={moderateScale(22)}
              color={colors.white}
            />
          </TouchableOpacity>
        )}

        <View style={styles.searchContainer}>
          {searchProps ? (
            <CustomTextInput
              containerStyle={styles.searchBarInputContainer}
              inputContainerStyle={styles.searchInputWrapper}
              leftIcon={Search01Icon}
              leftIconColor={colors.snapchatYellow}
              clearable={true}
              returnKeyType="search"
              {...searchProps}
            />
          ) : (
            children
          )}
        </View>

        {rightActions ? (
          <View style={styles.rightActionsContainer}>{rightActions}</View>
        ) : null}
      </View>
    );
  }

  // If subtitle exists or back button is not shown, default to left alignment. Otherwise default to center.
  const isCentered =
    titleAlign === 'center' || (titleAlign === undefined && showBackButton && !subtitle);

  const shouldHaveBorder =
    hasBottomBorder !== undefined ? hasBottomBorder : Boolean(subtitle);

  if (!isCentered) {
    return (
      <View
        style={[
          styles.headerContainer,
          shouldHaveBorder && styles.bottomBorder,
          styles.headerLeftAligned,
          containerStyle,
        ]}
      >
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={moderateScale(22)}
              color={colors.white}
            />
          </TouchableOpacity>
        )}

        <View style={styles.leftTextContainer}>
          {title ? (
            <Text
              numberOfLines={1}
              style={[
                subtitle ? styles.largeTitle : styles.standardTitle,
                titleStyle,
              ]}
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, subtitleStyle]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightActions ? (
          <View style={styles.rightActionsContainer}>{rightActions}</View>
        ) : null}
      </View>
    );
  }

  // Centered Header (typical for sub-screens: Create User, Details, etc.)
  return (
    <View
      style={[
        styles.headerContainer,
        shouldHaveBorder && styles.bottomBorder,
        styles.headerCentered,
        containerStyle,
      ]}
    >
      {showBackButton ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={moderateScale(22)}
            color={colors.white}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderButton} />
      )}

      <View style={styles.centeredTitleWrapper}>
        {title ? (
          <Text
            numberOfLines={1}
            style={[styles.standardTitle, styles.centeredTitleText, titleStyle]}
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[styles.subtitle, styles.centeredSubtitleText, subtitleStyle]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightActions ? (
        <View style={styles.rightActionsContainer}>{rightActions}</View>
      ) : (
        <View style={styles.placeholderButton} />
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(14),
  },
  headerLeftAligned: {
    justifyContent: 'space-between',
  },
  headerCentered: {
    justifyContent: 'space-between',
  },
  searchHeaderContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
    gap: horizontalScale(12),
  },
  searchContainer: {
    flex: 1,
  },
  searchBarInputContainer: {
    marginBottom: 0,
  },
  searchInputWrapper: {
    backgroundColor: colors.bgCard,
    borderRadius: moderateScale(22),
    minHeight: verticalScale(44),
    borderColor: colors.whiteTransparent10,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: verticalScale(16),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.whiteTransparent8,
    borderWidth: 1,
    borderColor: colors.whiteTransparent10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: moderateScale(40),
    height: moderateScale(40),
  },
  leftTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  centeredTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(8),
  },
  largeTitle: {
    color: colors.white,
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  standardTitle: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  centeredTitleText: {
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
    marginTop: verticalScale(4),
  },
  centeredSubtitleText: {
    textAlign: 'center',
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    marginLeft: horizontalScale(8),
  },
  actionIconButton: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: colors.yellowTransparent12,
    borderWidth: 1,
    borderColor: colors.yellowTransparent40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
