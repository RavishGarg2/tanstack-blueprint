import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LegendList } from '@legendapp/list/react-native';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { fetchPhotos, updateUserGender } from '../api/api';
import { queryKeys } from '../api/queryKeys';
import { SafeAreaView } from 'react-native-safe-area-context';
import { horizontalScale, verticalScale, moderateScale } from '../utils/utils';
import { colors } from '../assets/colors';
import FooterLoader from '../components/FooterLoader';
import UserCard from '../components/UserCard';
import { User } from '../api/types';
import SkeletonLoader from '../components/SkeletonLoader';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigationContainer';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowUp01Icon, Search01Icon, UserAdd01Icon } from '@hugeicons/core-free-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const limit = 15;
  const queryClient = useQueryClient();
  const listRef = useRef<any>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showScrollToTop ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showScrollToTop, fadeAnim]);

  const handleScroll = (event: any) => {
    const offsetY = event?.nativeEvent?.contentOffset?.y ?? 0;
    const shouldShow = offsetY > 500;
    setShowScrollToTop(prev => (prev !== shouldShow ? shouldShow : prev));
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const {
    data : users = [],
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.photos(limit),
    queryFn: ({ pageParam = 0 }) => fetchPhotos(limit, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      const nextSkip = lastPage.skip + lastPage.limit;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
    // Transforms paginated response into a flat array of users for the component
    select: data => data.pages.flatMap(page => page.users),
  });

  const toggleGenderMutation = useMutation({
    mutationFn: ({
      userId,
      newGender,
    }: {
      userId: number;
      newGender: 'male' | 'female';
    }) => updateUserGender(userId, newGender),
    onMutate: async ({ userId, newGender }) => {
      const queryKey = queryKeys.photos(limit);
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            const hasUser = page.users.some((u: any) => u.id === userId);
            if (!hasUser) return page;
            return {
              ...page,
              users: page.users.map((user: any) =>
                user.id === userId ? { ...user, gender: newGender } : user,
              ),
            };
          }),
        };
      });
      return { previousData };
    },
    onError: (err, vars, context) => {
      console.error('Failed to toggle gender:', err);
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.photos(limit), context.previousData);
      }
    },
  });


  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useRefreshOnFocus(queryKeys.photos(limit));

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Error loading feed: {error?.message}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>User Directory</Text>
          <Text style={styles.headerSubtitle}>
            Discover and connect with people
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('CreateUser')}
            activeOpacity={0.7}
          >
            <HugeiconsIcon
              icon={UserAdd01Icon}
              size={moderateScale(20)}
              color={colors.snapchatYellow}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('ProductSearch')}
            activeOpacity={0.7}
          >
            <HugeiconsIcon
              icon={Search01Icon}
              size={moderateScale(20)}
              color={colors.snapchatYellow}
            />
          </TouchableOpacity>
        </View>
      </View>

      <LegendList
        ref={listRef}
        data={users}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={50}
        renderItem={({ item }: { item: User }) => (
          <UserCard
            item={item}
            onToggleGender={(userId: number, newGender: 'male' | 'female') =>
              toggleGenderMutation.mutate({ userId, newGender })
            }
            onPress={() =>
              navigation.navigate('UserDetail', { userId: item.id })
            }
          />
        )}
        estimatedItemSize={104}
        recycleItems={true}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <FooterLoader /> : null}
      />

      <Animated.View
        pointerEvents={showScrollToTop ? 'auto' : 'none'}
        style={[
          styles.scrollToTopContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.scrollToTopButton}
          onPress={scrollToTop}
          activeOpacity={0.85}
        >
          <HugeiconsIcon
            icon={ArrowUp01Icon}
            size={moderateScale(22)}
            color={colors.black}
          />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
  },
  errorText: {
    color: colors.errorRed,
    fontSize: moderateScale(16),
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
    marginLeft: horizontalScale(12),
  },
  headerIconButton: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: colors.yellowTransparent12,
    borderWidth: 1,
    borderColor: colors.yellowTransparent40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
    marginTop: verticalScale(4),
  },
  listContent: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
  },
  scrollToTopContainer: {
    position: 'absolute',
    bottom: verticalScale(30),
    right: horizontalScale(20),
    zIndex: 99,
  },
  scrollToTopButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: colors.snapchatYellow,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});
