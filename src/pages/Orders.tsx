import { useOrders } from '../hooks/useCart';
import { useLanguage } from '../contexts/LanguageContext';
import { Package, Truck } from 'lucide-react';

export default function Orders() {
  const { orders, loading } = useOrders();
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('myOrders')}</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('noOrdersYet')}</h2>
          <p className="text-gray-600">{t('noOrdersYet')}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-mono font-semibold text-gray-900">{order.order_number}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm px-3 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                          src={item.image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">{t('quantity')}: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-blue-900">
                        {t('currency')} {item.total?.toLocaleString() || '0'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    <p>{order.items?.length || 0} {t('quantity')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{t('total')}</p>
                    <p className="text-xl font-bold text-blue-900">
                      {t('currency')} {order.total?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              {order.tracking_number && (
                <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">{t('tracking')}:</span>
                    <span className="font-mono text-gray-900">{order.tracking_number}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
