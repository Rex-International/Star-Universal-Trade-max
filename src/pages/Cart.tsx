import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../contexts/LanguageContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { items, loading, removeFromCart, updateQuantity, total, itemCount } = useCart();
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('shoppingCart')}</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('yourCartIsEmpty')}</h2>
          <p className="text-gray-600 mb-6">{t('startShopping')}</p>
          <Link
            to="/products"
            className="inline-block bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            {t('startShopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={
                        item.product?.images?.[0]?.url ||
                        'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=200'
                      }
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.product?.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.product?.category?.name || t('category')}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-lg font-bold text-blue-900">
                        {t('currency')} {((item.product?.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('orderSummary')}</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subtotal')} ({itemCount} {t('quantity')})</span>
                  <span className="font-medium">{t('currency')} {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('shipping')}</span>
                  <span className="font-medium text-green-600">{t('freeShipping')}</span>
                </div>
                <hr />
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-900">{t('total')}</span>
                  <span className="font-bold text-blue-900 text-lg">{t('currency')} {total.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="flex items-center justify-center gap-2 w-full mt-6 bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                {t('proceedToCheckout')}
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                to="/products"
                className="block text-center text-blue-600 hover:text-blue-800 mt-4 text-sm"
              >
                {t('continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
