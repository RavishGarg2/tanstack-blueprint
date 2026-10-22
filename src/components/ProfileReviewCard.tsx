import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  CheckmarkCircle02Icon,
  FemaleSymbolIcon,
  Mail01Icon,
  MaleSymbolIcon,
  PencilEdit01Icon,
} from '@hugeicons/core-free-icons';
import { colors } from '../assets/colors';
import { horizontalScale, moderateScale, verticalScale } from '../utils/utils';
import { UserFormValues } from '../utils/userDraft';

interface ProfileReviewCardProps {
  values: UserFormValues;
  onEditIdentity: () => void;
  onEditWork: () => void;
}

interface SummaryRowProps {
  label: string;
  value: string;
}

const SummaryRow = ({ label, value }: SummaryRowProps) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

export default function ProfileReviewCard({
  values,
  onEditIdentity,
  onEditWork,
}: ProfileReviewCardProps) {
  const fullName =
    `${values.firstName.trim()} ${values.lastName.trim()}`.trim() ||
    'Your Name';
  const email = values.email.trim() || '—';
  const role = values.role.trim() || 'Member';
  const company = values.companyName.trim() || 'Independent';
  const genderLabel = values.gender === 'female' ? 'Female' : 'Male';
  const isFemale = values.gender === 'female';

  return (
    <View>
      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>DIRECTORY PREVIEW</Text>

        <View style={styles.previewBody}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: values.avatarUrl }} style={styles.avatar} />
          </View>

          <View style={styles.identity}>
            <Text style={styles.name} numberOfLines={1}>
              {fullName}
            </Text>
            <Text style={styles.role} numberOfLines={1}>
              {role}
            </Text>
            <Text style={styles.company} numberOfLines={1}>
              {company}
            </Text>

            <View
              style={[
                styles.genderPill,
                isFemale ? styles.genderPillFemale : styles.genderPillMale,
              ]}
            >
              <HugeiconsIcon
                icon={isFemale ? FemaleSymbolIcon : MaleSymbolIcon}
                size={moderateScale(12)}
                color={isFemale ? colors.femalePink : colors.maleBlue}
              />
              <Text
                style={[
                  styles.genderText,
                  isFemale ? styles.genderTextFemale : styles.genderTextMale,
                ]}
              >
                {genderLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.previewDivider} />

        <View style={styles.emailRow}>
          <HugeiconsIcon
            icon={Mail01Icon}
            size={moderateScale(15)}
            color={colors.snapchatYellow}
          />
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Identity</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEditIdentity}
            activeOpacity={0.7}
          >
            <HugeiconsIcon
              icon={PencilEdit01Icon}
              size={moderateScale(12)}
              color={colors.snapchatYellow}
            />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <SummaryRow label="Full name" value={fullName} />
        <SummaryRow label="Gender" value={genderLabel} />

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Work & contact</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEditWork}
            activeOpacity={0.7}
          >
            <HugeiconsIcon
              icon={PencilEdit01Icon}
              size={moderateScale(12)}
              color={colors.snapchatYellow}
            />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <SummaryRow label="Email" value={email} />
        <SummaryRow label="Role" value={role} />
        <SummaryRow label="Company" value={company} />
      </View>

      <View style={styles.note}>
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={moderateScale(18)}
          color={colors.snapchatYellow}
        />
        <Text style={styles.noteText}>
          Everything looks good? Create your profile to add it to the directory.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    backgroundColor: colors.bgCardGlass,
    borderRadius: moderateScale(22),
    borderWidth: 1,
    borderColor: colors.yellowTransparent15,
    padding: moderateScale(18),
    marginBottom: verticalScale(14),
    overflow: 'hidden',
  },
  previewLabel: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(9),
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: verticalScale(14),
  },
  previewBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    padding: moderateScale(3),
    borderRadius: moderateScale(42),
    borderWidth: 1,
    borderColor: colors.yellowTransparent40,
    marginRight: horizontalScale(14),
  },
  avatar: {
    width: horizontalScale(72),
    height: horizontalScale(72),
    borderRadius: horizontalScale(36),
    backgroundColor: colors.bgAvatarPlaceholder,
    borderWidth: 2,
    borderColor: colors.snapchatYellow,
  },
  identity: {
    flex: 1,
  },
  name: {
    color: colors.white,
    fontSize: moderateScale(19),
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  role: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginTop: verticalScale(3),
  },
  company: {
    color: colors.textSecondary,
    fontSize: moderateScale(12),
    marginTop: verticalScale(1),
  },
  genderPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(4),
    borderRadius: moderateScale(6),
    paddingHorizontal: horizontalScale(7),
    paddingVertical: verticalScale(3),
    marginTop: verticalScale(8),
  },
  genderPillFemale: {
    backgroundColor: colors.femalePinkTransparent,
  },
  genderPillMale: {
    backgroundColor: colors.maleBlueTransparent,
  },
  genderText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  genderTextFemale: {
    color: colors.femalePink,
  },
  genderTextMale: {
    color: colors.maleBlue,
  },
  previewDivider: {
    height: 1,
    backgroundColor: colors.whiteTransparent8,
    marginVertical: verticalScale(14),
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  email: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: moderateScale(12),
  },
  summaryCard: {
    backgroundColor: colors.bgCardGlass,
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: colors.whiteTransparent8,
    padding: moderateScale(16),
    marginBottom: verticalScale(14),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(4),
  },
  sectionTitle: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(4),
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    backgroundColor: colors.yellowTransparent8,
    borderWidth: 1,
    borderColor: colors.yellowTransparent15,
  },
  editText: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: horizontalScale(16),
    paddingVertical: verticalScale(6),
  },
  summaryLabel: {
    color: colors.textLabel,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  summaryValue: {
    flex: 1,
    color: colors.white,
    fontSize: moderateScale(12),
    fontWeight: '600',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.whiteTransparent8,
    marginVertical: verticalScale(12),
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    backgroundColor: colors.yellowTransparent8,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.yellowTransparent15,
    padding: moderateScale(12),
  },
  noteText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
  },
});
