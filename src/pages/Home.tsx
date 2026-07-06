import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useProducts';
import { useLanguage } from '../contexts/LanguageContext';
import { ShoppingBag, Search, TrendingUp, Shield, Truck } from 'lucide-react';

export default function Home() {
  const [search, setSearch] = useState('');
  const { products, loading } = useProducts({ featured: true, limit: 8 });
  const { categories } = useCategories();
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">{t('welcomeBack')}, {t('appName')}</h1>
          <p className="text-xl sm:text-2xl text-blue-200 mb-8">{t('tagline')}</p>
          <Link
            to="/products"
            className="inline-block bg-orange-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg"
          >
            {t('allProducts')}
          </Link>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white shadow-md py-6">
        <div className="max-w-3xl mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchProducts')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
            />
            {search && (
              <Link
                to={`/products?search=${encodeURIComponent(search)}`}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700"
              >
                {t('search')}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('shopQualityProducts')}</h3>
              <p className="text-gray-600 text-sm">{t('shopQualityDesc')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('fastDelivery')}</h3>
              <p className="text-gray-600 text-sm">{t('fastDeliveryDesc')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('securePayments')}</h3>
              <p className="text-gray-600 text-sm">{t('securePaymentsDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{t('featuredProducts')}</h2>
            <p className="text-gray-600 mt-2">{t('discoverTopPicks')}</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('loading')}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">{t('noData')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-block border-2 border-blue-900 text-blue-900 px-6 py-3 rounded-xl font-semibold hover:bg-blue-900 hover:text-white transition-colors"
            >
              {t('viewAll')} {t('products')}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{t('shopByCategory')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="bg-white p-4 rounded-xl text-center hover:shadow-lg transition-shadow"
                >
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const { t } = useLanguage();
  const image = product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <Link
      to={`/products/${product.id}`}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2 truncate">{product.category?.name || t('category')}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-900">
            {t('currency')} {product.price.toLocaleString()}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {t('currency')} {product.compare_at_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
