import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Truck, Check } from 'lucide-react';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [address, setAddress] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Tanzania',
  });

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await createOrder({
      shipping_address: address,
      items: items.map((item) => ({
        product_id: item.product_id,
        product: item.product,
        quantity: item.quantity,
        price: item.product?.price || 0,
      })),
      subtotal: total,
      total: total,
    });

    if (result.data) {
      setOrderNumber(result.data.order_number);
      setSuccess(true);
      clearCart();
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('orderPlaced')}</h1>
          <p className="text-gray-600 mb-4">{t('orderPlaced')}.</p>
          <p className="text-sm text-gray-500 mb-6">
            {t('orderNumber')}: <span className="font-mono font-bold text-gray-900">{orderNumber}</span>
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            {t('orders')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkout')}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-blue-900" />
                <h2 className="text-lg font-semibold text-gray-900">{t('shippingAddress')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')}</label>
                  <input
                    type="text"
                    value={address.full_name}
                    onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('addressLine1')}</label>
                  <input
                    type="text"
                    value={address.address_line1}
                    onChange={(e) => setAddress({ ...address, address_line1: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('addressLine2')}</label>
                  <input
                    type="text"
                    value={address.address_line2}
                    onChange={(e) => setAddress({ ...address, address_line2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')}</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('state')}</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('postalCode')}</label>
                  <input
                    type="text"
                    value={address.postal_code}
                    onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('country')}</label>
                  <input
                    type="text"
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="h-5 w-5 text-blue-900" />
                <h2 className="text-lg font-semibold text-gray-900">{t('deliveryMethod')}</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-blue-500 rounded-lg bg-blue-50 cursor-pointer">
                  <input type="radio" name="delivery" defaultChecked className="text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{t('standardDelivery')}</p>
                    <p className="text-sm text-gray-500">2-5 {t('businessDays')} - {t('freeShipping')}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('orderSummary')}</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                      <img
                        src={item.product?.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">{t('quantity')}: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      {t('currency')} {((item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span>{t('currency')} {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('shipping')}</span>
                  <span className="text-green-600">{t('freeShipping')}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-base">
                  <span>{t('total')}</span>
                  <span className="text-blue-900">{t('currency')} {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
              >
                {loading ? t('loading') : t('placeOrder')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
