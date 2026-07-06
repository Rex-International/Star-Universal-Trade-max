import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useCart';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { ShoppingCart, Heart, ArrowLeft, Store, Check, Minus, Plus } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id || '');
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('noData')}</h1>
        <p className="text-gray-600 mb-6">{t('error')}</p>
        <Link to="/products" className="text-blue-600 hover:text-blue-800">
          {t('back')} {t('products')}
        </Link>
      </div>
    );
  }

  const image = product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800';

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product, quantity);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = async () => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/products"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t('back')} {t('products')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <img
              src={image}
              alt={product.name}
              className="w-full h-96 lg:h-[500px] object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.map((img: any) => (
                <div key={img.id} className="bg-white rounded-lg overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-20 object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <span className="text-sm text-blue-600 font-medium">
              {product.category?.name || t('category')}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>

            <div className="flex items-center gap-4 mt-4">
              <span className="text-3xl font-bold text-blue-900">
                {t('currency')} {product.price.toLocaleString()}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  {t('currency')} {product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2 mt-6">
              {product.quantity > 0 ? (
                <>
                  <span className="flex items-center text-green-600 text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    {t('inStock')} ({product.quantity} {t('quantity')})
                  </span>
                </>
              ) : (
                <span className="text-red-600 text-sm">{t('outOfStock')}</span>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('quantity')}</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-10 text-center border border-gray-300 rounded-lg"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={adding || product.quantity === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-900 text-white hover:bg-blue-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    {t('addedToCart')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    {adding ? t('loading') : t('addToCart')}
                  </>
                )}
              </button>
              <button
                onClick={handleWishlist}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Heart
                  className={`h-6 w-6 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>
            </div>

            {/* Seller Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Store className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('soldBy')}</p>
                  <p className="font-medium text-gray-900">{t('verifiedSeller')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">{t('genuineProduct')}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-xs text-gray-600">{t('freeShippingLabel')}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-xs text-gray-600">{t('easyReturns')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
