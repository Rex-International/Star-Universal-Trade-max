import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useCart';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function Wishlist() {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('wishlist')}</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('wishlist')}</h2>
          <p className="text-gray-600 mb-6">{t('wishlist')}.</p>
          <Link
            to="/products"
            className="inline-block bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            {t('browseProducts')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
              <Link to={`/products/${item.product_id}`} className="block">
                <div className="h-48 overflow-hidden">
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }
                    alt={item.product?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/products/${item.product_id}`}>
                  <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600">
                    {item.product?.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mt-1">{item.product?.category?.name || t('category')}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-blue-900">
                    {t('currency')} {(item.product?.price || 0).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <Link
                  to={`/products/${item.product_id}`}
                  className="flex items-center justify-center gap-2 w-full mt-3 bg-blue-900 text-white py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t('viewProduct')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
