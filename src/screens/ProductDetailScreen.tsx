import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigationContainer';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  StarIcon,
  PackageSearch01Icon,
  DeliveryTruck01Icon,
  Shield01Icon,
  Clock01Icon,
  ArrowReloadHorizontalIcon,
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
import { fetchProductById } from '../api/api';
import { queryKeys } from '../api/queryKeys';
import Loader from '../components/Loader';
import { ProductReview } from '../api/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - horizontalScale(40);

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const queryClient = useQueryClient();

  const { data: product, isLoading, error } = useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => fetchProductById(productId),
    placeholderData: () => {
      const searchQueries = queryClient.getQueriesData<any>({
        queryKey: ['products', 'infinite'],
      });
      const allProducts = searchQueries.flatMap(
        ([, queryData]) => queryData?.pages?.flatMap((page: any) => page.products) || [],
      );
      return allProducts.find((p: any) => p?.id === productId);
    },
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width,
    );
    if (slide !== activeImageIndex && slide >= 0) {
      setActiveImageIndex(slide);
    }
  };

  if (isLoading && !product) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Loader />
      </View>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>
          {error ? (error as Error).message : 'Product not found'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.thumbnail];
  const originalPrice = product.discountPercentage > 0
    ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  return (
    <View style={styles.container}>
      {/* Background Gradient Accent */}
      <View style={styles.gradientContainer}>
        <Svg height={verticalScale(300)} width="100%">
          <Defs>
            <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.gradientStop1} stopOpacity={0.35} />
              <Stop offset="60%" stopColor={colors.gradientStop2} stopOpacity={0.15} />
              <Stop offset="100%" stopColor={colors.bgPrimary} stopOpacity={0} />
            </SvgLinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#grad)" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Header
          title="Product Details"
          showBackButton={true}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Carousel */}
          <View style={styles.imageCarouselContainer}>
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <View style={styles.imageSlide}>
                  <Image
                    source={{ uri: item }}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            />
            {images.length > 1 && (
              <View style={styles.paginationDots}>
                {images.map((_: string, idx: number) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      activeImageIndex === idx ? styles.activeDot : null,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Core Product Info Card */}
          <View style={styles.mainInfoCard}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
              {product.brand ? (
                <View style={styles.brandBadge}>
                  <Text style={styles.brandBadgeText}>{product.brand}</Text>
                </View>
              ) : null}
              <View style={styles.ratingBadge}>
                <HugeiconsIcon
                  icon={StarIcon}
                  size={moderateScale(13)}
                  color={colors.snapchatYellow}
                  fill={colors.snapchatYellow}
                />
                <Text style={styles.ratingScore}>{product.rating.toFixed(1)}</Text>
              </View>
            </View>

            <Text style={styles.title}>{product.title}</Text>

            {/* Price & Stock Row */}
            <View style={styles.priceRow}>
              <View style={styles.priceGroup}>
                <Text style={styles.currentPrice}>${product.price.toFixed(2)}</Text>
                {originalPrice && (
                  <Text style={styles.originalPrice}>${originalPrice}</Text>
                )}
                {product.discountPercentage > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {Math.round(product.discountPercentage)}% OFF
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.stockBadge,
                  product.stock > 10 ? styles.inStockBadge : styles.lowStockBadge,
                ]}
              >
                <Text
                  style={[
                    styles.stockText,
                    product.stock > 10 ? styles.inStockText : styles.lowStockText,
                  ]}
                >
                  {product.availabilityStatus ||
                    (product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock')}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Specifications Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Specifications</Text>

            {product.sku ? (
              <View style={styles.specItem}>
                <View style={styles.iconContainer}>
                  <HugeiconsIcon
                    icon={PackageSearch01Icon}
                    size={moderateScale(18)}
                    color={colors.snapchatYellow}
                  />
                </View>
                <View style={styles.specContent}>
                  <Text style={styles.specLabel}>SKU</Text>
                  <Text style={styles.specValue}>{product.sku}</Text>
                </View>
              </View>
            ) : null}

            {product.weight ? (
              <View style={styles.specItem}>
                <View style={styles.iconContainer}>
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    size={moderateScale(18)}
                    color={colors.snapchatYellow}
                  />
                </View>
                <View style={styles.specContent}>
                  <Text style={styles.specLabel}>Weight</Text>
                  <Text style={styles.specValue}>{product.weight} kg</Text>
                </View>
              </View>
            ) : null}

            {product.dimensions ? (
              <View style={styles.specItem}>
                <View style={styles.iconContainer}>
                  <HugeiconsIcon
                    icon={PackageSearch01Icon}
                    size={moderateScale(18)}
                    color={colors.snapchatYellow}
                  />
                </View>
                <View style={styles.specContent}>
                  <Text style={styles.specLabel}>Dimensions (W × H × D)</Text>
                  <Text style={styles.specValue}>
                    {product.dimensions.width} × {product.dimensions.height} ×{' '}
                    {product.dimensions.depth} cm
                  </Text>
                </View>
              </View>
            ) : null}

            {product.warrantyInformation ? (
              <View style={styles.specItem}>
                <View style={styles.iconContainer}>
                  <HugeiconsIcon
                    icon={Shield01Icon}
                    size={moderateScale(18)}
                    color={colors.snapchatYellow}
                  />
                </View>
                <View style={styles.specContent}>
                  <Text style={styles.specLabel}>Warranty</Text>
                  <Text style={styles.specValue}>{product.warrantyInformation}</Text>
                </View>
              </View>
            ) : null}

            {product.shippingInformation ? (
              <View style={styles.specItem}>
                <View style={styles.iconContainer}>
                  <HugeiconsIcon
                    icon={DeliveryTruck01Icon}
                    size={moderateScale(18)}
                    color={colors.snapchatYellow}
                  />
                </View>
                <View style={styles.specContent}>
                  <Text style={styles.specLabel}>Shipping</Text>
                  <Text style={styles.specValue}>{product.shippingInformation}</Text>
                </View>
              </View>
            ) : null}

            {product.returnPolicy ? (
              <View style={[styles.specItem, styles.noBorder]}>
                <View style={styles.iconContainer}>
                  <HugeiconsIcon
                    icon={ArrowReloadHorizontalIcon}
                    size={moderateScale(18)}
                    color={colors.snapchatYellow}
                  />
                </View>
                <View style={styles.specContent}>
                  <Text style={styles.specLabel}>Return Policy</Text>
                  <Text style={styles.specValue}>{product.returnPolicy}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Customer Reviews Section */}
          {product.reviews && product.reviews.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Customer Reviews ({product.reviews.length})
              </Text>

              {product.reviews.map((rev: ProductReview, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.reviewItem,
                    index === product.reviews!.length - 1 ? styles.noBorder : null,
                  ]}
                >
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text style={styles.reviewerName}>{rev.reviewerName}</Text>
                      <Text style={styles.reviewDate}>
                        {new Date(rev.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={styles.reviewRatingBadge}>
                      <HugeiconsIcon
                        icon={StarIcon}
                        size={moderateScale(11)}
                        color={colors.snapchatYellow}
                        fill={colors.snapchatYellow}
                      />
                      <Text style={styles.reviewRatingText}>{rev.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              ))}
            </View>
          )}
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
    height: verticalScale(300),
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
  imageCarouselContainer: {
    alignItems: 'center',
    marginVertical: verticalScale(12),
  },
  imageSlide: {
    width: IMAGE_WIDTH,
    height: verticalScale(220),
    backgroundColor: colors.bgCard,
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.whiteTransparent8,
    overflow: 'hidden',
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(10),
    gap: horizontalScale(6),
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: colors.whiteTransparent10,
  },
  activeDot: {
    width: moderateScale(18),
    backgroundColor: colors.snapchatYellow,
  },
  mainInfoCard: {
    backgroundColor: colors.bgCardGlass,
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: colors.whiteTransparent8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: horizontalScale(8),
    marginBottom: verticalScale(10),
  },
  categoryBadge: {
    backgroundColor: colors.yellowTransparent12,
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  categoryText: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(11),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  brandBadge: {
    backgroundColor: colors.whiteTransparent8,
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  brandBadgeText: {
    color: colors.white,
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellowTransparent8,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    gap: horizontalScale(4),
    marginLeft: 'auto',
  },
  ratingScore: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  title: {
    color: colors.white,
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    lineHeight: moderateScale(28),
    marginBottom: verticalScale(12),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  currentPrice: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(24),
    fontWeight: 'bold',
  },
  originalPrice: {
    color: colors.textMuted,
    fontSize: moderateScale(16),
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.femalePinkTransparent,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(6),
  },
  discountText: {
    color: colors.femalePink,
    fontSize: moderateScale(11),
    fontWeight: 'bold',
  },
  stockBadge: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  inStockBadge: {
    backgroundColor: colors.yellowTransparent12,
  },
  lowStockBadge: {
    backgroundColor: colors.femalePinkTransparent,
  },
  stockText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  inStockText: {
    color: colors.snapchatYellow,
  },
  lowStockText: {
    color: colors.femalePink,
  },
  description: {
    color: colors.textSecondary,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
  },
  sectionCard: {
    backgroundColor: colors.bgCardGlass,
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: colors.whiteTransparent8,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    marginBottom: verticalScale(12),
    letterSpacing: 0.3,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteTransparent5,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(10),
    backgroundColor: colors.yellowTransparent8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(14),
  },
  specContent: {
    flex: 1,
  },
  specLabel: {
    color: colors.textLabel,
    fontSize: moderateScale(11),
    fontWeight: '500',
    marginBottom: verticalScale(2),
  },
  specValue: {
    color: colors.white,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  reviewItem: {
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteTransparent5,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  reviewerName: {
    color: colors.white,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  reviewDate: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  reviewRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellowTransparent12,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(6),
    gap: horizontalScale(4),
  },
  reviewRatingText: {
    color: colors.snapchatYellow,
    fontSize: moderateScale(11),
    fontWeight: 'bold',
  },
  reviewComment: {
    color: colors.textSecondary,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
  },
  errorText: {
    color: colors.errorRed,
    fontSize: moderateScale(15),
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  retryButton: {
    backgroundColor: colors.snapchatYellow,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
  },
  retryButtonText: {
    color: colors.black,
    fontWeight: 'bold',
    fontSize: moderateScale(14),
  },
});
