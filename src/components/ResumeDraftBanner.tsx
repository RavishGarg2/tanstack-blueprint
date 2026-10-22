import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { colors } from '../assets/colors';
import { horizontalScale, moderateScale, verticalScale } from '../utils/utils';
import { formatDraftAge, UserFormDraft } from '../utils/userDraft';

interface ResumeDraftBannerProps {
  draft: UserFormDraft;
  totalSteps: number;
  onResume: () => void;
  onStartFresh: () => void;
}

export default function ResumeDraftBanner({
  draft,
  totalSteps,
  onResume,
  onStartFresh,
}: ResumeDraftBannerProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrapper}>
          <HugeiconsIcon
            icon={Clock01Icon}
            size={moderateScale(18)}
            color={colors.snapchatYellow}
          />
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>Resume previous draft?</Text>
          <Text style={styles.subtitle}>
            You left off at Step {draft.step + 1} of {totalSteps} ·{' '}
            {formatDraftAge(draft.lastSavedAt)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.action, styles.secondaryAction]}
          onPress={onStartFresh}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryText}>Start Fresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.action, styles.primaryAction]}
          onPress={onResume}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryText}>Resume</Text>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={moderateScale(14)}
            color={colors.black}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 230, 0, 0.06)',
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: colors.yellowTransparent15,
    padding: moderateScale(14),
    marginBottom: verticalScale(18),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: colors.yellowTransparent12,
    borderWidth: 1,
    borderColor: colors.yellowTransparent15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(12),
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontSize: moderateScale(13),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
    marginTop: verticalScale(3),
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: horizontalScale(10),
    marginTop: verticalScale(12),
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(34),
    paddingHorizontal: horizontalScale(14),
    borderRadius: moderateScale(11),
    gap: horizontalScale(5),
  },
  secondaryAction: {
    backgroundColor: colors.whiteTransparent5,
    borderWidth: 1,
    borderColor: colors.whiteTransparent10,
  },
  primaryAction: {
    backgroundColor: colors.snapchatYellow,
  },
  secondaryText: {
    color: colors.textSecondary,
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  primaryText: {
    color: colors.black,
    fontSize: moderateScale(11),
    fontWeight: '800',
  },
});
