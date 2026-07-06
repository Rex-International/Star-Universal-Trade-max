import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { CartItem, Product, Order, OrderItem } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      const localCart = localStorage.getItem('sut_cart');
      if (localCart) {
        setItems(JSON.parse(localCart));
      }
      setLoading(false);
    }
  }, [user]);

  async function fetchCart() {
    try {
      const cartRef = collection(db, 'cart_items');
      const q = query(cartRef, where('user_id', '==', user!.uid), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const cartItems: CartItem[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let product = null;

        if (data.product_id) {
          const productRef = doc(db, 'products', data.product_id);
          const productSnap = await getDocs(query(collection(db, 'products'), where('__name__', '==', data.product_id)));
          const pDoc = productSnap.docs[0];
          if (pDoc) {
            const productData = pDoc.data();
            const imagesSnap = await getDocs(query(collection(db, 'product_images'), where('product_id', '==', data.product_id)));
            product = {
              id: pDoc.id,
              ...productData,
              images: imagesSnap.docs.map((img) => ({ id: img.id, ...img.data() })),
            };
          }
        }

        cartItems.push({
          id: docSnap.id,
          ...data,
          product,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as CartItem);
      }

      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }

  const addToCart = useCallback(
    async (product: Product, quantity: number = 1) => {
      if (user) {
        try {
          const cartRef = collection(db, 'cart_items');
          const q = query(cartRef, where('user_id', '==', user.uid), where('product_id', '==', product.id));
          const existingSnap = await getDocs(q);

          if (!existingSnap.empty) {
            const existingDoc = existingSnap.docs[0];
            const existingData = existingDoc.data();
            await updateDoc(existingDoc.ref, {
              quantity: (existingData.quantity || 0) + quantity,
              updated_at: serverTimestamp(),
            });
          } else {
            await addDoc(cartRef, {
              user_id: user.uid,
              product_id: product.id,
              quantity,
              created_at: serverTimestamp(),
              updated_at: serverTimestamp(),
            });
          }
          await fetchCart();
        } catch (error) {
          console.error('Error adding to cart:', error);
        }
      } else {
        const localCart: CartItem[] = JSON.parse(localStorage.getItem('sut_cart') || '[]');
        const existing = localCart.find((item) => item.product_id === product.id);
        if (existing) {
          existing.quantity += quantity;
        } else {
          localCart.push({
            id: `local_${Date.now()}`,
            user_id: '',
            product_id: product.id,
            quantity,
            product,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as CartItem);
        }
        localStorage.setItem('sut_cart', JSON.stringify(localCart));
        setItems(localCart);
      }
    },
    [user]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      if (user) {
        try {
          await deleteDoc(doc(db, 'cart_items', itemId));
          await fetchCart();
        } catch (error) {
          console.error('Error removing from cart:', error);
        }
      } else {
        const localCart = items.filter((item) => item.id !== itemId);
        localStorage.setItem('sut_cart', JSON.stringify(localCart));
        setItems(localCart);
      }
    },
    [user, items]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;
      if (user) {
        try {
          await updateDoc(doc(db, 'cart_items', itemId), { quantity, updated_at: serverTimestamp() });
          await fetchCart();
        } catch (error) {
          console.error('Error updating quantity:', error);
        }
      } else {
        const localCart = items.map((item) => (item.id === itemId ? { ...item, quantity } : item));
        localStorage.setItem('sut_cart', JSON.stringify(localCart));
        setItems(localCart);
      }
    },
    [user, items]
  );

  const clearCart = useCallback(async () => {
    if (user) {
      try {
        const cartRef = collection(db, 'cart_items');
        const q = query(cartRef, where('user_id', '==', user.uid));
        const snapshot = await getDocs(q);
        for (const docSnap of snapshot.docs) {
          await deleteDoc(docSnap.ref);
        }
        setItems([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      localStorage.removeItem('sut_cart');
      setItems([]);
    }
  }, [user]);

  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
  };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  async function fetchOrders() {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('user_id', '==', user!.uid), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const ordersData: Order[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const itemsRef = collection(db, 'order_items');
        const itemsQ = query(itemsRef, where('order_id', '==', docSnap.id));
        const itemsSnap = await getDocs(itemsQ);

        ordersData.push({
          id: docSnap.id,
          ...data,
          items: itemsSnap.docs.map((item) => ({ id: item.id, ...item.data() })),
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Order);
      }

      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createOrder(orderData: {
    shipping_address: Record<string, unknown>;
    items: CartItem[];
    subtotal: number;
    total: number;
  }) {
    const orderNumber = `SUT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        user_id: user!.uid,
        order_number: orderNumber,
        shipping_address: orderData.shipping_address,
        subtotal: orderData.subtotal,
        shipping_cost: 0,
        tax: 0,
        discount: 0,
        total: orderData.total,
        status: 'pending',
        payment_status: 'pending',
        currency: 'TZS',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const orderItems = orderData.items.map((item) => ({
        order_id: orderRef.id,
        product_id: item.product_id,
        product_name: item.product?.name || 'Product',
        price: item.product?.price || 0,
        quantity: item.quantity,
        total: (item.product?.price || 0) * item.quantity,
        image_url: item.product?.images?.[0]?.url || '',
      }));

      for (const item of orderItems) {
        await addDoc(collection(db, 'order_items'), {
          ...item,
          created_at: serverTimestamp(),
        });
      }

      await fetchOrders();
      return { data: { id: orderRef.id, order_number: orderNumber } };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  return { orders, loading, createOrder, refetch: fetchOrders };
}

export function useWishlist() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  async function fetchWishlist() {
    try {
      const wishlistRef = collection(db, 'wishlists');
      const q = query(wishlistRef, where('user_id', '==', user!.uid), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const wishlists: any[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let product = null;

        if (data.product_id) {
          const productDoc = await getDocs(query(collection(db, 'products'), where('__name__', '==', data.product_id)));
          const pDoc = productDoc.docs[0];
          if (pDoc) {
            const productData = pDoc.data();
            const imagesSnap = await getDocs(query(collection(db, 'product_images'), where('product_id', '==', data.product_id)));
            product = {
              id: pDoc.id,
              ...productData,
              images: imagesSnap.docs.map((img) => ({ id: img.id, ...img.data() })),
            };
          }
        }

        wishlists.push({
          id: docSnap.id,
          ...data,
          product,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        });
      }

      setItems(wishlists);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addToWishlist(productId: string) {
    try {
      await addDoc(collection(db, 'wishlists'), {
        user_id: user!.uid,
        product_id: productId,
        created_at: serverTimestamp(),
      });
      await fetchWishlist();
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async function removeFromWishlist(id: string) {
    try {
      await deleteDoc(doc(db, 'wishlists', id));
      await fetchWishlist();
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  }

  function isInWishlist(productId: string) {
    return items.some((item) => item.product_id === productId);
  }

  return { items, loading, addToWishlist, removeFromWishlist, isInWishlist };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  async function fetchNotifications() {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('user_id', '==', user!.uid), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));

      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      await updateDoc(doc(db, 'notifications', id), { is_read: true });
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('user_id', '==', user!.uid), where('is_read', '==', false));
      const snapshot = await getDocs(q);
      for (const docSnap of snapshot.docs) {
        await updateDoc(docSnap.ref, { is_read: true });
      }
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead };
}
