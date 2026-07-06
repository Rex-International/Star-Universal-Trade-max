import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../hooks/useCart';
import { useState } from 'react';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Heart,
  Settings,
  Store,
  LayoutDashboard,
  ChevronDown,
  Globe,
} from 'lucide-react';

export default function Layout() {
  const { user, profile, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('products'), href: '/products' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">{t('appName')}</span>
              <span className="text-white font-bold text-lg sm:hidden">{t('appShortName')}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href) ? 'text-orange-400' : 'text-white hover:text-orange-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center space-x-1 text-white hover:text-orange-300 transition-colors"
                >
                  <Globe className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase hidden sm:block">{language}</span>
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        language === 'en' ? 'text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('sw');
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        language === 'sw' ? 'text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      Kiswahili
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative text-white hover:text-orange-300 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-white hover:text-orange-300 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {profile?.full_name || t('user')}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {t('dashboard')}
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        {t('orders')}
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        {t('wishlist')}
                      </Link>
                      <Link
                        to="/seller"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Store className="h-4 w-4 mr-2" />
                        {t('seller')}
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {t('profile')}
                      </Link>
                      {profile?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-orange-600 hover:bg-gray-100 font-medium"
                        >
                          {t('admin')}
                        </Link>
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-white hover:text-orange-300 text-sm font-medium transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-800 px-4 py-3 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${isActive(item.href) ? 'text-orange-400' : 'text-white'}`}
              >
                {item.name}
              </Link>
            ))}
            {!user && (
              <div className="pt-3 border-t border-blue-700 flex space-x-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-sm font-medium"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-orange-400 text-sm font-medium"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{t('appName')}</h3>
              <p className="text-blue-200 text-sm">{t('tagline')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('quickLinks')}</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <Link to="/products" className="hover:text-white">
                    {t('products')}
                  </Link>
                </li>
                <li>
                  <Link to="/seller" className="hover:text-white">
                    {t('becomeSeller')}
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-white">
                    {t('cart')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('account')}</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <Link to="/dashboard" className="hover:text-white">
                    {t('dashboard')}
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="hover:text-white">
                    {t('orders')}
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="hover:text-white">
                    {t('wishlist')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('contact')}</h4>
              <p className="text-sm text-blue-200">
                {t('location')}
                <br />
                {t('supportEmail')}
              </p>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-sm text-blue-200">
            &copy; {new Date().getFullYear()} {t('appName')}. {t('allRights')}
          </div>
        </div>
      </footer>
    </div>
  );
}
