import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useCart';
import { useWishlist } from '../hooks/useCart';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Package,
  ShoppingCart,
  Heart,
  User,
  Store,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

export default function Dashboard() {
  const { profile } = useAuth();
  const { orders } = useOrders();
  const { items } = useWishlist();
  const { t } = useLanguage();

  const menuItems = [
    { name: t('products'), href: '/products', icon: ShoppingCart, description: t('browseCatalog') },
    { name: t('orders'), href: '/orders', icon: Package, description: t('myOrders') },
    { name: t('wishlist'), href: '/wishlist', icon: Heart, description: t('wishlist'), badge: items.length },
    { name: t('profile'), href: '/profile', icon: User, description: t('profileSettings') },
    { name: t('seller'), href: '/seller', icon: Store, description: t('manageProducts') },
    { name: t('profile'), href: '/profile', icon: Settings, description: t('profileSettings') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-3 mb-4">
          <LayoutDashboard className="h-8 w-8" />
          <h1 className="text-2xl font-bold">{t('welcomeBack')}, {profile?.full_name || 'User'}!</h1>
        </div>
        <p className="text-blue-200">{t('manageAccount')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-blue-200 text-sm">{t('orders')}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-2xl font-bold">{items.length}</p>
            <p className="text-blue-200 text-sm">{t('wishlist')}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-2xl font-bold">0</p>
            <p className="text-blue-200 text-sm">{t('reviews')}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-2xl font-bold capitalize">{profile?.role || 'Customer'}</p>
            <p className="text-blue-200 text-sm">{t('accountType')}</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-900 transition-colors">
                <item.icon className="h-6 w-6 text-blue-900 group-hover:text-white transition-colors" />
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mt-4">{item.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('recentOrders')}</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-900">
                      {t('currency')} {order.total.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {orders.length > 3 && (
              <Link
                to="/orders"
                className="block text-center text-blue-600 hover:text-blue-800 py-3 border-t border-gray-200"
              >
                {t('viewAll')} {t('orders')}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
