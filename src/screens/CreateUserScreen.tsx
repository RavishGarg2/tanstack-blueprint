import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigationContainer';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  UserAdd01Icon,
  Mail01Icon,
  Briefcase01Icon,
  Building01Icon,
  ArrowReloadHorizontalIcon,
  MaleSymbolIcon,
  FemaleSymbolIcon,
} from '@hugeicons/core-free-icons';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import { horizontalScale, verticalScale, moderateScale } from '../utils/utils';
import { colors } from '../assets/colors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { createUser } from '../api/api';
import { queryKeys } from '../api/queryKeys';
import { CreateUserInput, User } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateUser'>;

const AVATAR_PRESETS = [
  'https://dummyjson.com/icon/emilys/128',
  'https://dummyjson.com/icon/michaelw/128',
  'https://dummyjson.com/icon/sophiab/128',
  'https://dummyjson.com/icon/jamesd/128',
  'https://dummyjson.com/icon/emmaj/128',
  'https://dummyjson.com/icon/alexanderj/128',
];

const sanitizeAlphabetic = (text: string) =>
  text.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ');

export default function CreateUserScreen({ navigation }: Props) {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserInput) => createUser(userData),
    onError: (error: any) => {
      Alert.alert(
        'Creation Failed',
        error?.message || 'Could not create user. Please try again.',
      );
    },
    onSuccess: (confirmedUser: User, vars) => {
      const fullUser: User = {
        ...confirmedUser,
        firstName: confirmedUser.firstName || vars.firstName,
        lastName: confirmedUser.lastName || vars.lastName,
        email: confirmedUser.email || vars.email,
        gender: confirmedUser.gender || vars.gender,
        image: confirmedUser.image || vars.image || AVATAR_PRESETS[0],
        role: confirmedUser.role || vars.role || 'Member',
        company: confirmedUser.company || vars.company || {
          title: vars.role || 'Member',
          name: 'Independent',
        },
      };

      // Update feed cache with the confirmed user
      queryClient.setQueryData(queryKeys.photos(15), (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        const newPages = [...oldData.pages];
        if (newPages.length > 0) {
          newPages[0] = {
            ...newPages[0],
            users: [fullUser, ...newPages[0].users],
            total: (newPages[0].total || 0) + 1,
          };
        }
        return {
          ...oldData,
          pages: newPages,
        };
      });

      // Seed individual user query cache for instant detail view navigation
      queryClient.setQueryData(queryKeys.user(fullUser.id), fullUser);

      Alert.alert(
        'User Created! 🎉',
        `${fullUser.firstName} ${fullUser.lastName} has been added to the directory.`,
        [
          {
            text: 'View Profile',
            onPress: () => {
              navigation.replace('UserDetail', { userId: fullUser.id });
            },
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ],
      );
    },
  });

  // TanStack Form instance with type-safe field definitions and validation
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      companyName: '',
      gender: 'male' as 'male' | 'female',
      avatarUrl: AVATAR_PRESETS[0],
    },
    onSubmit: async ({ value }) => {
      const payload: CreateUserInput = {
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        email: value.email.trim(),
        gender: value.gender,
        role: value.role.trim() || 'Member',
        image: value.avatarUrl,
        company: {
          title: value.role.trim() || 'Member',
          name: value.companyName.trim() || 'Independent',
        },
      };

      createUserMutation.mutate(payload);
    },
  });

  return (
    <View style={styles.container}>
      {/* Background Gradient Accent */}
      <View style={styles.gradientContainer}>
        <Svg height={verticalScale(280)} width="100%">
          <Defs>
            <SvgLinearGradient id="createGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.gradientStop1} stopOpacity={0.35} />
              <Stop offset="60%" stopColor={colors.gradientStop2} stopOpacity={0.15} />
              <Stop offset="100%" stopColor={colors.bgPrimary} stopOpacity={0} />
            </SvgLinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#createGrad)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={moderateScale(22)}
              color={colors.white}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Member</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Section with Cycle Action */}
            <form.Field name="avatarUrl">
              {field => {
                const cycleAvatar = () => {
                  const currentIndex = AVATAR_PRESETS.indexOf(field.state.value);
                  const nextIndex =
                    currentIndex === -1
                      ? 0
                      : (currentIndex + 1) % AVATAR_PRESETS.length;
                  field.handleChange(AVATAR_PRESETS[nextIndex]);
                };

                return (
                  <View style={styles.avatarSection}>
                    <View style={styles.avatarOuterRing}>
                      <View style={styles.avatarInnerRing}>
                        <Image
                          source={{ uri: field.state.value }}
                          style={styles.avatarHero}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.randomizeButton}
                      onPress={cycleAvatar}
                      activeOpacity={0.8}
                    >
                      <HugeiconsIcon
                        icon={ArrowReloadHorizontalIcon}
                        size={moderateScale(16)}
                        color={colors.snapchatYellow}
                      />
                      <Text style={styles.randomizeText}>Change Avatar</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            </form.Field>

            {/* Form Section */}
            <View style={styles.formCard}>
              <Text style={styles.formHeading}>Profile Information</Text>

              {/* Names Row (First Name + Last Name) */}
              <View style={styles.row}>
                {/* First Name Field */}
                <form.Field
                  name="firstName"
                  validators={{
                    onChange: ({ value }) =>
                      !value.trim() ? 'First name is required' : undefined,
                  }}
                >
                  {field => (
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.label}>First Name *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          field.state.meta.errors.length > 0 && styles.inputError,
                        ]}
                        placeholder="Jane"
                        placeholderTextColor={colors.textLabel}
                        value={field.state.value}
                        onChangeText={text =>
                          field.handleChange(sanitizeAlphabetic(text))
                        }
                        onBlur={field.handleBlur}
                        autoCapitalize="words"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text style={styles.errorText}>
                          {field.state.meta.errors.join(', ')}
                        </Text>
                      )}
                    </View>
                  )}
                </form.Field>

                {/* Last Name Field */}
                <form.Field
                  name="lastName"
                  validators={{
                    onChange: ({ value }) =>
                      !value.trim() ? 'Last name is required' : undefined,
                  }}
                >
                  {field => (
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.label}>Last Name *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          field.state.meta.errors.length > 0 && styles.inputError,
                        ]}
                        placeholder="Doe"
                        placeholderTextColor={colors.textLabel}
                        value={field.state.value}
                        onChangeText={text =>
                          field.handleChange(sanitizeAlphabetic(text))
                        }
                        onBlur={field.handleBlur}
                        autoCapitalize="words"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text style={styles.errorText}>
                          {field.state.meta.errors.join(', ')}
                        </Text>
                      )}
                    </View>
                  )}
                </form.Field>
              </View>

              {/* Email Field */}
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    if (!value.trim()) return 'Email address is required';
                    if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
                    return undefined;
                  },
                }}
              >
                {field => (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address *</Text>
                    <View
                      style={[
                        styles.iconInputWrapper,
                        field.state.meta.errors.length > 0 && styles.inputError,
                      ]}
                    >
                      <HugeiconsIcon
                        icon={Mail01Icon}
                        size={moderateScale(18)}
                        color={colors.textMuted}
                        style={styles.fieldIcon}
                      />
                      <TextInput
                        style={styles.iconInput}
                        placeholder="jane.doe@example.com"
                        placeholderTextColor={colors.textLabel}
                        value={field.state.value}
                        onChangeText={field.handleChange}
                        onBlur={field.handleBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    {field.state.meta.errors.length > 0 && (
                      <Text style={styles.errorText}>
                        {field.state.meta.errors.join(', ')}
                      </Text>
                    )}
                  </View>
                )}
              </form.Field>

              {/* Gender Selection Cards */}
              <form.Field name="gender">
                {field => (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender Identity</Text>
                    <View style={styles.genderRow}>
                      <TouchableOpacity
                        style={[
                          styles.genderCard,
                          field.state.value === 'male' &&
                            styles.genderCardMaleSelected,
                        ]}
                        onPress={() => field.handleChange('male')}
                        activeOpacity={0.8}
                      >
                        <HugeiconsIcon
                          icon={MaleSymbolIcon}
                          size={moderateScale(16)}
                          color={
                            field.state.value === 'male'
                              ? colors.maleBlue
                              : colors.textMuted
                          }
                          transform="rotate(180)"
                        />
                        <Text
                          style={[
                            styles.genderText,
                            field.state.value === 'male' &&
                              styles.genderTextMale,
                          ]}
                        >
                          Male
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.genderCard,
                          field.state.value === 'female' &&
                            styles.genderCardFemaleSelected,
                        ]}
                        onPress={() => field.handleChange('female')}
                        activeOpacity={0.8}
                      >
                        <HugeiconsIcon
                          icon={FemaleSymbolIcon}
                          size={moderateScale(18)}
                          color={
                            field.state.value === 'female'
                              ? colors.femalePink
                              : colors.textMuted
                          }
                        />
                        <Text
                          style={[
                            styles.genderText,
                            field.state.value === 'female' &&
                              styles.genderTextFemale,
                          ]}
                        >
                          Female
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </form.Field>

              {/* Role / Job Title Field */}
              <form.Field name="role">
                {field => (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Job Title / Role</Text>
                    <View style={styles.iconInputWrapper}>
                      <HugeiconsIcon
                        icon={Briefcase01Icon}
                        size={moderateScale(18)}
                        color={colors.textMuted}
                        style={styles.fieldIcon}
                      />
                      <TextInput
                        style={styles.iconInput}
                        placeholder="e.g. Senior Developer"
                        placeholderTextColor={colors.textLabel}
                        value={field.state.value}
                        onChangeText={text =>
                          field.handleChange(sanitizeAlphabetic(text))
                        }
                      />
                    </View>
                  </View>
                )}
              </form.Field>

              {/* Company Name Field */}
              <form.Field name="companyName">
                {field => (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Company / Organization</Text>
                    <View style={styles.iconInputWrapper}>
                      <HugeiconsIcon
                        icon={Building01Icon}
                        size={moderateScale(18)}
                        color={colors.textMuted}
                        style={styles.fieldIcon}
                      />
                      <TextInput
                        style={styles.iconInput}
                        placeholder="e.g. Acme Tech"
                        placeholderTextColor={colors.textLabel}
                        value={field.state.value}
                        onChangeText={text =>
                          field.handleChange(text.replace(/\s+/g, ' '))
                        }
                      />
                    </View>
                  </View>
                )}
              </form.Field>
            </View>

            {/* Reactive Submit Button */}
            <form.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!canSubmit ||
                      isSubmitting ||
                      createUserMutation.isPending) &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={form.handleSubmit}
                  disabled={
                    !canSubmit || isSubmitting || createUserMutation.isPending
                  }
                  activeOpacity={0.85}
                >
                  {createUserMutation.isPending || isSubmitting ? (
                    <ActivityIndicator color={colors.black} size="small" />
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={UserAdd01Icon}
                        size={moderateScale(20)}
                        color={colors.black}
                      />
                      <Text style={styles.submitButtonText}>
                        Create User Profile
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </form.Subscribe>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
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
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(12),
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
  headerTitle: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerPlaceholder: {
    width: moderateScale(40),
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(40),
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(20),
  },
  avatarOuterRing: {
    padding: moderateScale(4),
    borderRadius: moderateScale(60),
    borderWidth: 1,
    borderColor: colors.yellowTransparent15,
    marginBottom: verticalScale(12),
  },
  avatarInnerRing: {
    padding: moderateScale(4),
    borderRadius: moderateScale(54),
    borderWidth: 1,
    borderColor: colors.yellowTransparent40,
  },
  avatarHero: {
    width: horizontalScale(90),
    height: horizontalScale(90),
    borderRadius: horizontalScale(45),
    backgroundColor: colors.bgAvatarPlaceholder,
    borderWidth: 2,
    borderColor: colors.snapchatYellow,
  },
  randomizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellowTransparent12,
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(16),
    gap: horizontalScale(6),
  },
  randomizeText: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  formCard: {
    backgroundColor: colors.bgCardGlass,
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    borderWidth: 1,
    borderColor: colors.whiteTransparent8,
    marginBottom: verticalScale(20),
  },
  formHeading: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    marginBottom: verticalScale(16),
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: horizontalScale(12),
  },
  halfWidth: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: verticalScale(14),
  },
  label: {
    color: colors.textLabel,
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginBottom: verticalScale(6),
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.whiteTransparent5,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.whiteTransparent10,
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(12),
    color: colors.white,
    fontSize: moderateScale(14),
  },
  iconInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.whiteTransparent5,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.whiteTransparent10,
    paddingHorizontal: horizontalScale(14),
    gap: 10
  },
  fieldIcon: {
    marginRight: horizontalScale(10),
  },
  iconInput: {
    flex: 1,
    paddingVertical: verticalScale(12),
    color: colors.white,
    fontSize: moderateScale(14),
  },
  inputError: {
    borderColor: colors.errorRed,
  },
  errorText: {
    color: colors.errorRed,
    fontSize: moderateScale(11),
    marginTop: verticalScale(4),
    marginLeft: horizontalScale(4),
  },
  genderRow: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },
  genderCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.whiteTransparent5,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.whiteTransparent10,
    paddingVertical: verticalScale(12),
    gap: horizontalScale(5),
  },
  genderCardMaleSelected: {
    backgroundColor: colors.maleBlueTransparent,
    borderColor: colors.maleBlue,
  },
  genderCardFemaleSelected: {
    backgroundColor: colors.femalePinkTransparent,
    borderColor: colors.femalePink,
  },
  genderText: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  genderTextMale: {
    color: colors.maleBlue,
    fontWeight: '700',
  },
  genderTextFemale: {
    color: colors.femalePink,
    fontWeight: '700',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.snapchatYellow,
    borderRadius: moderateScale(18),
    paddingVertical: verticalScale(15),
    gap: horizontalScale(10),
    shadowColor: colors.snapchatYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.black,
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
