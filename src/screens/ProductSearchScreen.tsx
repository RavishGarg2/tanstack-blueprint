import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigationContainer';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  PackageSearch01Icon,
} from '@hugeicons/core-free-icons';
import { LegendList } from '@legendapp/list/react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { horizontalScale, verticalScale, moderateScale } from '../utils/utils';
import { colors } from '../assets/colors';
import { searchProducts } from '../api/api';
import { queryKeys } from '../api/queryKeys';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import FooterLoader from '../components/FooterLoader';
import { Product } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductSearch'>;

const PAGE_LIMIT = 20;

export default function ProductSearchScreen({ navigation }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm.trim(), 400);

  const {
    data: { products = [], total = 0 } = {},
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: queryKeys.productsSearch(debouncedSearch),
    queryFn: ({ pageParam = 0 }) =>
      searchProducts(debouncedSearch, PAGE_LIMIT, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      const nextSkip = lastPage.skip + lastPage.limit;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
    // Transforms paginated response for the component
    select: data => ({
      products: data.pages.flatMap(page => page.products),
      total: data.pages[0]?.total ?? 0,
    }),
    enabled: debouncedSearch.length > 0,
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });

  const isSearching = isFetching && !isFetchingNextPage && debouncedSearch.length > 0;

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <Header
        showBackButton={true}
        onBack={() => navigation.goBack()}
        searchProps={{
          placeholder: 'Search products (e.g. phone, shoes)...',
          value: searchTerm,
          onChangeText: setSearchTerm,
          autoFocus: true,
        }}
      />

      {/* Query Status Bar */}
      {debouncedSearch.length > 0 && (
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {isLoading
              ? 'Searching DummyJSON...'
              : `Found ${total} result${total === 1 ? '' : 's'} for "${debouncedSearch}"`}
          </Text>
          {isSearching && (
            <ActivityIndicator
              size="small"
              color={colors.snapchatYellow}
              style={styles.loadingSpinner}
            />
          )}
        </View>
      )}

      {/* Body Content */}
      {searchTerm.trim().length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.iconCircle}>
            <HugeiconsIcon
              icon={PackageSearch01Icon}
              size={moderateScale(48)}
              color={colors.snapchatYellow}
            />
          </View>
          <Text style={styles.emptyTitle}>Explore Products</Text>
          <Text style={styles.emptySubtitle}>
            Search thousands of products by keyword, category, or brand with instant TanStack caching.
          </Text>
          <View style={styles.quickTagsContainer}>
            {['phone', 'laptop', 'fragrance', 'watch', 'shoes'].map(tag => (
              <TouchableOpacity
                key={tag}
                style={styles.quickTag}
                onPress={() => setSearchTerm(tag)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickTagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.snapchatYellow} />
          <Text style={styles.loadingText}>Fetching products...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            Error searching products: {(error as Error).message}
          </Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySubtitle}>
            We couldn't find any products matching "{debouncedSearch}". Try another keyword.
          </Text>
        </View>
      ) : (
        <LegendList
          data={products}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={120}
          recycleItems={true}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <FooterLoader /> : null}
          renderItem={({ item }: { item: Product }) => (
            <ProductCard
              item={item}
              onPress={() =>
                navigation.navigate('ProductDetail', { productId: item.id })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(8),
    backgroundColor: colors.whiteTransparent5,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: moderateScale(12),
  },
  loadingSpinner: {
    marginLeft: horizontalScale(8),
  },
  listContent: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(32),
  },
  iconCircle: {
    width: moderateScale(88),
    height: moderateScale(88),
    borderRadius: moderateScale(44),
    backgroundColor: colors.yellowTransparent12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: colors.yellowTransparent40,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(13),
    textAlign: 'center',
    lineHeight: moderateScale(18),
  },
  quickTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: horizontalScale(8),
    marginTop: verticalScale(24),
  },
  quickTag: {
    backgroundColor: colors.yellowTransparent15,
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: colors.yellowTransparent40,
  },
  quickTagText: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: moderateScale(14),
    marginTop: verticalScale(12),
  },
  errorText: {
    color: colors.errorRed,
    fontSize: moderateScale(14),
    textAlign: 'center',
  },
});
