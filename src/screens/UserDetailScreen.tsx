import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigationContainer';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Mail01Icon,
  Briefcase01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import { horizontalScale, verticalScale, moderateScale } from '../utils/utils';
import { colors } from '../assets/colors';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserById } from '../api/api';
import { queryKeys } from '../api/queryKeys';
import Loader from '../components/Loader';

type Props = NativeStackScreenProps<RootStackParamList, 'UserDetail'>;

export default function UserDetailScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => fetchUserById(userId),
    placeholderData: () => {
      const feedData: any = queryClient.getQueryData(queryKeys.photos(15));
      const allUsers = feedData?.pages.flatMap((page: any) => page.users) || [];
      return allUsers.find((u: any) => u.id === userId);
    },
  });

  if (isLoading && !user) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient Accent */}
      <View style={styles.gradientContainer}>
        <Svg height={verticalScale(280)} width="100%">
          <Defs>
            <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.gradientStop1} stopOpacity={0.4} />
              <Stop offset="60%" stopColor={colors.gradientStop2} stopOpacity={0.2} />
              <Stop offset="100%" stopColor={colors.bgPrimary} stopOpacity={0} />
            </SvgLinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#grad)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Header
          title="Profile"
          showBackButton={true}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card Hero */}
          <View style={styles.heroSection}>
            <View style={styles.avatarOuterRing}>
              <View style={styles.avatarInnerRing}>
                <Image source={{ uri: user?.image || '' }} style={styles.avatar} />
              </View>
            </View>

            <Text style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Text>
            <View style={styles.companyTag}>
              <Text style={styles.companyText}>
                {user?.company?.name || 'Independent'}
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Information</Text>

            {/* Role Row */}
            <View style={styles.detailItem}>
              <View style={styles.iconContainer}>
                <HugeiconsIcon
                  icon={Briefcase01Icon}
                  size={moderateScale(20)}
                  color={colors.snapchatYellow}
                />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Title & Company</Text>
                <Text style={styles.detailValue}>
                  {user?.company?.title || 'User'}
                </Text>
                <Text style={styles.detailSubvalue}>
                  {user?.company?.name || 'Independent'}
                </Text>
              </View>
            </View>

            {/* Email Row */}
            <View style={styles.detailItem}>
              <View style={styles.iconContainer}>
                <HugeiconsIcon
                  icon={Mail01Icon}
                  size={moderateScale(20)}
                  color={colors.snapchatYellow}
                />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Email Address</Text>
                <Text style={styles.detailValue}>{user?.email}</Text>
              </View>
            </View>

            {/* Gender Row */}
            <View style={[styles.detailItem, styles.noBorder]}>
              <View style={styles.iconContainer}>
                <HugeiconsIcon
                  icon={UserIcon}
                  size={moderateScale(20)}
                  color={colors.snapchatYellow}
                />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Gender Identity</Text>
                <Text
                  style={[
                    styles.detailValue,
                    user?.gender === 'female'
                      ? styles.femaleText
                      : styles.maleText,
                  ]}
                >
                  {user?.gender === 'female' ? 'Female ♀' : 'Male ♂'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(280),
    zIndex: 0,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(40),
  },
  heroSection: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
  },
  avatarOuterRing: {
    padding: moderateScale(4),
    borderRadius: moderateScale(72),
    borderWidth: 1,
    borderColor: colors.yellowTransparent15,
    marginBottom: verticalScale(20),
  },
  avatarInnerRing: {
    padding: moderateScale(4),
    borderRadius: moderateScale(66),
    borderWidth: 1,
    borderColor: colors.yellowTransparent40,
  },
  avatar: {
    width: horizontalScale(110),
    height: horizontalScale(110),
    borderRadius: horizontalScale(55),
    backgroundColor: colors.bgAvatarPlaceholder,
    borderWidth: 2,
    borderColor: colors.snapchatYellow,
  },
  name: {
    color: colors.white,
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  companyTag: {
    marginTop: verticalScale(8),
    backgroundColor: colors.yellowTransparent12,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(14),
  },
  companyText: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoSection: {
    backgroundColor: colors.bgCardGlass,
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    paddingBottom : moderateScale(4),
    borderWidth: 1,
    borderColor: colors.whiteTransparent8,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    marginBottom: verticalScale(8),
    letterSpacing: 0.3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteTransparent5,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(12),
    backgroundColor: colors.yellowTransparent8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  detailTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    color: colors.textLabel,
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginBottom: verticalScale(2),
  },
  detailValue: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  detailSubvalue: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    marginTop: verticalScale(2),
  },
  femaleText: {
    color: colors.femalePink,
  },
  maleText: {
    color: colors.maleBlue,
  },
});
