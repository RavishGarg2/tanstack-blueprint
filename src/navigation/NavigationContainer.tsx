import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import UserDetailScreen from '../screens/UserDetailScreen';
import ProductSearchScreen from '../screens/ProductSearchScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CreateUserScreen from '../screens/CreateUserScreen';

export type RootStackParamList = {
  Home: undefined;
  UserDetail: { userId: number };
  ProductSearch: undefined;
  ProductDetail: { productId: number };
  CreateUser: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="UserDetail" component={UserDetailScreen} />
        <Stack.Screen name="ProductSearch" component={ProductSearchScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="CreateUser" component={CreateUserScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;