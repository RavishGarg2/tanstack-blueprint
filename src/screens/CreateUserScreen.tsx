import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useSelector } from '@tanstack/react-form';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Briefcase01Icon,
  Building01Icon,
  FemaleSymbolIcon,
  Mail01Icon,
  MaleSymbolIcon,
  SparklesIcon,
  Tick02Icon,
  UserAdd01Icon,
} from '@hugeicons/core-free-icons';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import CustomTextInput from '../components/CustomTextInput';
import Header from '../components/Header';
import ProfileReviewCard from '../components/ProfileReviewCard';
import ResumeDraftBanner from '../components/ResumeDraftBanner';
import StepProgress from '../components/StepProgress';
import { RootStackParamList } from '../navigation/NavigationContainer';
import { createUser } from '../api/api';
import { queryKeys } from '../api/queryKeys';
import { CreateUserInput, User } from '../api/types';
import { colors } from '../assets/colors';
import {
  clearDraft,
  hasDraftContent,
  loadDraft,
  saveDraft,
  UserFormDraft,
  UserFormValues,
} from '../utils/userDraft';
import { horizontalScale, moderateScale, verticalScale } from '../utils/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateUser'>;
type StepField = Exclude<keyof UserFormValues, 'avatarUrl'>;

interface StepDefinition {
  title: string;
  fields: StepField[];
}

const AVATAR_PRESETS = [
  'https://dummyjson.com/icon/emilys/128',
  'https://dummyjson.com/icon/michaelw/128',
  'https://dummyjson.com/icon/sophiab/128',
  'https://dummyjson.com/icon/jamesd/128',
  'https://dummyjson.com/icon/emmaj/128',
  'https://dummyjson.com/icon/alexanderj/128',
];

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    title: 'Identity',
    fields: ['firstName', 'lastName', 'gender'],
  },
  {
    title: 'Contact & Work',
    fields: ['email', 'role', 'companyName'],
  },
  {
    title: 'Review',
    fields: [],
  },
];

const STEP_TITLES = STEP_DEFINITIONS.map(step => step.title);
const ALL_FIELDS = STEP_DEFINITIONS.flatMap(step => step.fields);
const TOTAL_STEPS = STEP_DEFINITIONS.length;
const LAST_STEP = TOTAL_STEPS - 1;
const SAVE_DEBOUNCE_MS = 450;

const createDefaultValues = (): UserFormValues => ({
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  companyName: '',
  gender: 'male',
  avatarUrl: AVATAR_PRESETS[0],
});

const sanitizeAlphabetic = (text: string) =>
  text.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ');

const findStepForField = (field: StepField) =>
  Math.max(
    0,
    STEP_DEFINITIONS.findIndex(step => step.fields.includes(field)),
  );

export default function CreateUserScreen({ navigation }: Props) {
  const queryClient = useQueryClient();

  const [resumeDraft, setResumeDraft] = useState<UserFormDraft | null>(() =>
    loadDraft(),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const persistEnabledRef = useRef(resumeDraft === null);
  const allowExitRef = useRef(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(12)).current;

  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserInput) => createUser(userData),
    onError: (error: any) => {
      Alert.alert(
        'Creation Failed',
        error?.message || 'Could not create user. Please try again.',
      );
    },
    onSuccess: (confirmedUser: User, vars) => {
      persistEnabledRef.current = false;
      allowExitRef.current = true;
      clearDraft();

      const fullUser: User = {
        ...confirmedUser,
        firstName: confirmedUser.firstName || vars.firstName,
        lastName: confirmedUser.lastName || vars.lastName,
        email: confirmedUser.email || vars.email,
        gender: confirmedUser.gender || vars.gender,
        image: confirmedUser.image || vars.image || AVATAR_PRESETS[0],
        role: confirmedUser.role || vars.role || 'Member',
        company: confirmedUser.company ||
          vars.company || {
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

  const form = useForm({
    defaultValues: createDefaultValues(),
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

      try {
        await createUserMutation.mutateAsync(payload);
      } catch {
        // The mutation's onError handler presents the failure to the user.
      }
    },
  });

  const values = useSelector(form.store, state => state.values);
  const isDirty = useSelector(form.store, state => state.isDirty);
  const isSubmitting = useSelector(form.store, state => state.isSubmitting);
  const showLoading = isSubmitting || createUserMutation.isPending;
  const busy = isAdvancing || showLoading;

  const latestValuesRef = useRef(values);
  const latestStepRef = useRef(currentStep);

  useEffect(() => {
    latestValuesRef.current = values;
  }, [values]);

  useEffect(() => {
    latestStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    contentOpacity.setValue(0);
    contentTranslate.setValue(12);

    const animation = Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [contentOpacity, contentTranslate, currentStep]);

  // Persist field edits shortly after typing stops.
  useEffect(() => {
    if (!persistEnabledRef.current) {
      return;
    }

    if (currentStep === 0 && !isDirty) {
      return;
    }

    const timeout = setTimeout(() => {
      saveDraft(values, currentStep);
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [currentStep, isDirty, values]);

  // Typing over an unresolved resume banner implicitly starts fresh.
  useEffect(() => {
    if (!resumeDraft || !isDirty) {
      return;
    }

    persistEnabledRef.current = true;
    setResumeDraft(null);
    saveDraft(form.state.values, currentStep);
  }, [currentStep, form, isDirty, resumeDraft]);

  const exitNow = useCallback(() => {
    allowExitRef.current = true;
    navigation.goBack();
  }, [navigation]);

  const handleDiscardAndExit = useCallback(() => {
    persistEnabledRef.current = false;
    clearDraft();
    exitNow();
  }, [exitNow]);

  const handleSaveAndExit = useCallback(() => {
    // If the user never resumed an existing draft, keep that snapshot intact
    // instead of overwriting it with the untouched form.
    if (!resumeDraft || isDirty) {
      saveDraft(form.state.values, currentStep);
    }
    exitNow();
  }, [currentStep, exitNow, form, isDirty, resumeDraft]);

  const showExitAlert = useCallback(() => {
    Alert.alert(
      'Leave profile setup?',
      'You have profile details in progress. Save this draft to pick up where you left off, or discard it.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: handleDiscardAndExit,
        },
        { text: 'Save Draft & Exit', onPress: handleSaveAndExit },
      ],
    );
  }, [handleDiscardAndExit, handleSaveAndExit]);

  const goToStep = useCallback(
    (nextStep: number) => {
      const clampedStep = Math.min(
        LAST_STEP,
        Math.max(0, Math.round(nextStep)),
      );

      Keyboard.dismiss();
      setCurrentStep(clampedStep);
      saveDraft(form.state.values, clampedStep);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    },
    [form],
  );

  const handleBack = useCallback(() => {
    if (busy) {
      return;
    }

    if (currentStep > 0) {
      goToStep(currentStep - 1);
      return;
    }

    if (isDirty || hasDraftContent(form.state.values) || Boolean(resumeDraft)) {
      showExitAlert();
      return;
    }

    exitNow();
  }, [
    busy,
    currentStep,
    exitNow,
    form,
    goToStep,
    isDirty,
    resumeDraft,
    showExitAlert,
  ]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', event => {
      if (allowExitRef.current) {
        return;
      }

      if (busy) {
        event.preventDefault();
        return;
      }

      if (currentStep > 0) {
        event.preventDefault();
        goToStep(currentStep - 1);
        return;
      }

      if (
        isDirty ||
        hasDraftContent(form.state.values) ||
        Boolean(resumeDraft)
      ) {
        event.preventDefault();
        showExitAlert();
      }
    });

    return unsubscribe;
  }, [
    busy,
    currentStep,
    form,
    goToStep,
    isDirty,
    navigation,
    resumeDraft,
    showExitAlert,
  ]);

  // Flush one final snapshot if the screen is removed without an explicit exit.
  useEffect(() => {
    return () => {
      if (!persistEnabledRef.current) {
        return;
      }

      if (
        latestStepRef.current === 0 &&
        !hasDraftContent(latestValuesRef.current)
      ) {
        return;
      }

      saveDraft(latestValuesRef.current, latestStepRef.current);
    };
  }, []);

  const handleResumeDraft = useCallback(() => {
    if (!resumeDraft) {
      return;
    }

    persistEnabledRef.current = true;
    form.reset(resumeDraft.values, { keepDefaultValues: true });
    setCurrentStep(Math.min(LAST_STEP, Math.max(0, resumeDraft.step)));
    setResumeDraft(null);
    Keyboard.dismiss();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [form, resumeDraft]);

  const handleStartFresh = useCallback(() => {
    Alert.alert(
      'Start fresh?',
      'Your previous draft will be discarded and cannot be recovered.',
      [
        { text: 'Keep Draft', style: 'cancel' },
        {
          text: 'Start Fresh',
          style: 'destructive',
          onPress: () => {
            persistEnabledRef.current = false;
            clearDraft();
            form.reset();
            setCurrentStep(0);
            setResumeDraft(null);
            persistEnabledRef.current = true;
            scrollRef.current?.scrollTo({ y: 0, animated: false });
          },
        },
      ],
    );
  }, [form]);

  const handleNext = useCallback(async () => {
    if (busy) {
      return;
    }

    setIsAdvancing(true);

    try {
      if (currentStep < LAST_STEP) {
        const results = await Promise.all(
          STEP_DEFINITIONS[currentStep].fields.map(field =>
            form.validateField(field, 'change'),
          ),
        );

        if (results.some(errors => errors.length > 0)) {
          return;
        }

        goToStep(currentStep + 1);
        return;
      }

      const results = await Promise.all(
        ALL_FIELDS.map(field => form.validateField(field, 'change')),
      );
      const invalidFieldIndex = results.findIndex(errors => errors.length > 0);

      if (invalidFieldIndex >= 0) {
        const invalidField = ALL_FIELDS[invalidFieldIndex];
        if (invalidField) {
          goToStep(findStepForField(invalidField));
        }
        return;
      }

      Keyboard.dismiss();
      await form.handleSubmit();
    } finally {
      setIsAdvancing(false);
    }
  }, [busy, currentStep, form, goToStep]);

  const handleStepPress = useCallback(
    (step: number) => {
      if (step < currentStep) {
        goToStep(step);
      }
    },
    [currentStep, goToStep],
  );

  const handleAvatarSelect = useCallback(
    (avatarUrl: string) => {
      form.setFieldValue('avatarUrl', avatarUrl);
    },
    [form],
  );

  const isReviewStep = currentStep === LAST_STEP;

  return (
    <View style={styles.container}>
      {/* Background Gradient Accent */}
      <View style={styles.gradientContainer}>
        <Svg height={verticalScale(280)} width="100%">
          <Defs>
            <SvgLinearGradient
              id="createGrad"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop
                offset="0%"
                stopColor={colors.gradientStop1}
                stopOpacity={0.35}
              />
              <Stop
                offset="60%"
                stopColor={colors.gradientStop2}
                stopOpacity={0.15}
              />
              <Stop
                offset="100%"
                stopColor={colors.bgPrimary}
                stopOpacity={0}
              />
            </SvgLinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#createGrad)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <Header title="New Member" showBackButton={true} onBack={handleBack} />

        <StepProgress
          currentStep={currentStep}
          steps={STEP_TITLES}
          onStepPress={handleStepPress}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {resumeDraft ? (
              <ResumeDraftBanner
                draft={resumeDraft}
                totalSteps={TOTAL_STEPS}
                onResume={handleResumeDraft}
                onStartFresh={handleStartFresh}
              />
            ) : null}

            <Animated.View
              style={{
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslate }],
              }}
            >
              {/* Step 1: Identity & Avatar */}
              <View style={currentStep === 0 ? undefined : styles.hiddenStep}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepEyebrow}>STEP 1</Text>
                  <Text style={styles.stepTitle}>
                    Who&apos;s joining the directory?
                  </Text>
                  <Text style={styles.stepSubtitle}>
                    Pick an avatar and add the basics. Your name is the one
                    thing people can&apos;t miss.
                  </Text>
                </View>

                <View style={styles.avatarSection}>
                  <View style={styles.avatarOuterRing}>
                    <View style={styles.avatarInnerRing}>
                      <Image
                        source={{ uri: values.avatarUrl }}
                        style={styles.avatarHero}
                      />
                    </View>
                  </View>
                  <Text style={styles.avatarCaption}>
                    This is how you&apos;ll appear in the directory
                  </Text>
                </View>

                <View style={styles.presetSection}>
                  <View style={styles.presetLabelRow}>
                    <Text style={styles.presetLabel}>AVATAR PRESETS</Text>
                    <Text style={styles.presetHint}>Tap to select</Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.presetList}
                  >
                    {AVATAR_PRESETS.map((avatarUrl, index) => {
                      const isSelected = values.avatarUrl === avatarUrl;

                      return (
                        <TouchableOpacity
                          key={avatarUrl}
                          style={[
                            styles.presetOption,
                            isSelected && styles.presetOptionSelected,
                          ]}
                          onPress={() => handleAvatarSelect(avatarUrl)}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel={`Avatar preset ${index + 1}`}
                          accessibilityState={{ selected: isSelected }}
                        >
                          <Image
                            source={{ uri: avatarUrl }}
                            style={styles.presetImage}
                          />

                          {isSelected ? (
                            <View style={styles.presetCheck}>
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                size={moderateScale(9)}
                                color={colors.black}
                              />
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.formCard}>
                  <Text style={styles.formHeading}>Identity details</Text>

                  <View style={styles.row}>
                    <form.Field
                      name="firstName"
                      validators={{
                        onChange: ({ value }) =>
                          !value.trim() ? 'First name is required' : undefined,
                      }}
                    >
                      {field => (
                        <CustomTextInput
                          containerStyle={styles.halfWidth}
                          label="First Name"
                          isRequired
                          placeholder="Jane"
                          value={field.state.value}
                          onChangeText={text =>
                            field.handleChange(sanitizeAlphabetic(text))
                          }
                          onBlur={field.handleBlur}
                          autoCapitalize="words"
                          error={field.state.meta.errors}
                        />
                      )}
                    </form.Field>

                    <form.Field
                      name="lastName"
                      validators={{
                        onChange: ({ value }) =>
                          !value.trim() ? 'Last name is required' : undefined,
                      }}
                    >
                      {field => (
                        <CustomTextInput
                          containerStyle={styles.halfWidth}
                          label="Last Name"
                          isRequired
                          placeholder="Doe"
                          value={field.state.value}
                          onChangeText={text =>
                            field.handleChange(sanitizeAlphabetic(text))
                          }
                          onBlur={field.handleBlur}
                          autoCapitalize="words"
                          error={field.state.meta.errors}
                        />
                      )}
                    </form.Field>
                  </View>

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
                            accessibilityRole="button"
                            accessibilityState={{
                              selected: field.state.value === 'male',
                            }}
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
                            accessibilityRole="button"
                            accessibilityState={{
                              selected: field.state.value === 'female',
                            }}
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
                </View>
              </View>

              {/* Step 2: Work & Contact */}
              <View style={currentStep === 1 ? undefined : styles.hiddenStep}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepEyebrow}>STEP 2</Text>
                  <Text style={styles.stepTitle}>
                    How can people reach you?
                  </Text>
                  <Text style={styles.stepSubtitle}>
                    Your email is required. Role and company help colleagues
                    find you, but they&apos;re optional.
                  </Text>
                </View>

                <View style={styles.formCard}>
                  <Text style={styles.formHeading}>Contact & work</Text>

                  <form.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.trim()) {
                          return 'Email address is required';
                        }
                        if (!/\S+@\S+\.\S+/.test(value)) {
                          return 'Invalid email format';
                        }
                        return undefined;
                      },
                    }}
                  >
                    {field => (
                      <CustomTextInput
                        label="Email Address"
                        isRequired
                        leftIcon={Mail01Icon}
                        placeholder="jane.doe@example.com"
                        value={field.state.value}
                        onChangeText={field.handleChange}
                        onBlur={field.handleBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="emailAddress"
                        error={field.state.meta.errors}
                      />
                    )}
                  </form.Field>

                  <form.Field name="role">
                    {field => (
                      <CustomTextInput
                        label="Job Title / Role"
                        leftIcon={Briefcase01Icon}
                        placeholder="e.g. Senior Developer"
                        value={field.state.value}
                        onChangeText={text =>
                          field.handleChange(sanitizeAlphabetic(text))
                        }
                        onBlur={field.handleBlur}
                        autoCapitalize="words"
                        error={field.state.meta.errors}
                      />
                    )}
                  </form.Field>

                  <form.Field name="companyName">
                    {field => (
                      <CustomTextInput
                        label="Company / Organization"
                        leftIcon={Building01Icon}
                        placeholder="e.g. Acme Tech"
                        value={field.state.value}
                        onChangeText={text =>
                          field.handleChange(text.replace(/\s+/g, ' '))
                        }
                        onBlur={field.handleBlur}
                        autoCapitalize="words"
                        error={field.state.meta.errors}
                      />
                    )}
                  </form.Field>

                  <View style={styles.helperNote}>
                    <HugeiconsIcon
                      icon={SparklesIcon}
                      size={moderateScale(16)}
                      color={colors.snapchatYellow}
                    />
                    <Text style={styles.helperText}>
                      No company? We&apos;ll list you as Independent. No title?
                      We&apos;ll use Member.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Step 3: Review & Confirm */}
              <View style={currentStep === 2 ? undefined : styles.hiddenStep}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepEyebrow}>STEP 3</Text>
                  <Text style={styles.stepTitle}>Ready to meet the team?</Text>
                  <Text style={styles.stepSubtitle}>
                    Give your profile a final look before it goes live in the
                    directory.
                  </Text>
                </View>

                <ProfileReviewCard
                  values={values}
                  onEditIdentity={() => goToStep(0)}
                  onEditWork={() => goToStep(1)}
                />
              </View>
            </Animated.View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerBack, busy && styles.footerDisabled]}
              onPress={handleBack}
              disabled={busy}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={
                currentStep === 0 ? 'Exit profile setup' : 'Previous step'
              }
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={moderateScale(16)}
                color={colors.textSecondary}
              />
              <Text style={styles.footerBackText}>
                {currentStep === 0 ? 'Exit' : 'Back'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.footerPrimary,
                busy && styles.footerPrimaryDisabled,
              ]}
              onPress={handleNext}
              disabled={busy}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={
                isReviewStep ? 'Create user profile' : 'Continue to next step'
              }
            >
              {showLoading ? (
                <ActivityIndicator color={colors.black} size="small" />
              ) : (
                <>
                  <Text style={styles.footerPrimaryText}>
                    {isReviewStep ? 'Create User Profile' : 'Continue'}
                  </Text>
                  <HugeiconsIcon
                    icon={isReviewStep ? UserAdd01Icon : ArrowRight01Icon}
                    size={moderateScale(18)}
                    color={colors.black}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(20),
  },
  hiddenStep: {
    display: 'none',
  },
  stepHeader: {
    marginBottom: verticalScale(16),
    paddingHorizontal: horizontalScale(2),
  },
  stepEyebrow: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: verticalScale(6),
  },
  stepTitle: {
    color: colors.white,
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    marginTop: verticalScale(6),
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },
  avatarOuterRing: {
    padding: moderateScale(5),
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
    width: horizontalScale(92),
    height: horizontalScale(92),
    borderRadius: horizontalScale(46),
    backgroundColor: colors.bgAvatarPlaceholder,
    borderWidth: 2,
    borderColor: colors.snapchatYellow,
  },
  avatarCaption: {
    color: colors.textSubMuted,
    fontSize: moderateScale(11),
    letterSpacing: 0.2,
  },
  presetSection: {
    marginBottom: verticalScale(18),
  },
  presetLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  presetLabel: {
    color: colors.textLabel,
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  presetHint: {
    color: colors.textSubMuted,
    fontSize: moderateScale(10),
  },
  presetList: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: horizontalScale(8),
    paddingVertical: verticalScale(2),
  },
  presetOption: {
    width: horizontalScale(46),
    height: horizontalScale(46),
    borderRadius: horizontalScale(23),
    padding: moderateScale(2),
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetOptionSelected: {
    borderColor: colors.snapchatYellow,
    backgroundColor: colors.yellowTransparent12,
  },
  presetImage: {
    width: '100%',
    height: '100%',
    borderRadius: horizontalScale(21),
    backgroundColor: colors.bgAvatarPlaceholder,
  },
  presetCheck: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    backgroundColor: colors.snapchatYellow,
    borderWidth: 2,
    borderColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: colors.bgCardGlass,
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    borderWidth: 1,
    borderColor: colors.whiteTransparent8,
    marginBottom: verticalScale(18),
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
  helperNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(9),
    backgroundColor: colors.yellowTransparent8,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: colors.yellowTransparent15,
    padding: moderateScale(11),
  },
  helperText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(11),
    paddingBottom: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: colors.whiteTransparent8,
    backgroundColor: colors.bgPrimary,
  },
  footerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(6),
    height: verticalScale(50),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: colors.whiteTransparent10,
    backgroundColor: colors.whiteTransparent5,
  },
  footerBackText: {
    color: colors.textSecondary,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  footerPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(8),
    height: verticalScale(50),
    borderRadius: moderateScale(16),
    backgroundColor: colors.snapchatYellow,
    shadowColor: colors.snapchatYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  footerPrimaryDisabled: {
    opacity: 0.6,
  },
  footerPrimaryText: {
    color: colors.black,
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  footerDisabled: {
    opacity: 0.55,
  },
});
