import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';
import { Product, Category, ProductImage } from '../lib/types';

export function useProducts(options?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [options?.category, options?.featured, options?.limit, options?.search]);

  async function fetchProducts() {
    setLoading(true);
    setError(null);

    try {
      const productsRef = collection(db, 'products');
      let q = query(productsRef, where('is_active', '==', true), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);

      const productsData: Product[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let categoryData = null;
        let imagesData: ProductImage[] = [];

        if (data.category_id) {
          const catDoc = await getDoc(doc(db, 'categories', data.category_id));
          if (catDoc.exists()) {
            categoryData = { id: catDoc.id, ...catDoc.data() } as Category;
          }
        }

        const imagesRef = collection(db, 'product_images');
        const imagesQ = query(imagesRef, where('product_id', '==', docSnap.id), orderBy('display_order', 'asc'));
        const imagesSnap = await getDocs(imagesQ);
        imagesData = imagesSnap.docs.map((img) => ({ id: img.id, ...img.data() })) as ProductImage[];

        productsData.push({
          id: docSnap.id,
          ...data,
          category: categoryData,
          images: imagesData,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Product);
      }

      let filtered = productsData;

      if (options?.category && options.category !== 'all') {
        filtered = filtered.filter((p) => p.category_id === options.category);
      }

      if (options?.featured) {
        filtered = filtered.filter((p) => p.is_featured);
      }

      if (options?.search) {
        const search = options.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            (p.description || '').toLowerCase().includes(search) ||
            (p.category?.name || '').toLowerCase().includes(search)
        );
      }

      if (options?.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      setProducts(filtered);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { products, loading, error, refetch: fetchProducts };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  async function fetchProduct() {
    setLoading(true);
    setError(null);

    try {
      const productRef = doc(db, 'products', id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      const data = productSnap.data();
      let categoryData = null;
      let imagesData: ProductImage[] = [];

      if (data.category_id) {
        const catDoc = await getDoc(doc(db, 'categories', data.category_id));
        if (catDoc.exists()) {
          categoryData = { id: catDoc.id, ...catDoc.data() } as Category;
        }
      }

      const imagesRef = collection(db, 'product_images');
      const imagesQ = query(imagesRef, where('product_id', '==', id), orderBy('display_order', 'asc'));
      const imagesSnap = await getDocs(imagesQ);
      imagesData = imagesSnap.docs.map((img) => ({ id: img.id, ...img.data() })) as ProductImage[];

      setProduct({
        id: productSnap.id,
        ...data,
        category: categoryData,
        images: imagesData,
        created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Product);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { product, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('display_order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  return { categories, loading };
}

export function useSellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSellerProducts() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('seller_id', '==', currentUser.uid), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const productsData: Product[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let imagesData: ProductImage[] = [];

        const imagesRef = collection(db, 'product_images');
        const imagesQ = query(imagesRef, where('product_id', '==', docSnap.id));
        const imagesSnap = await getDocs(imagesQ);
        imagesData = imagesSnap.docs.map((img) => ({ id: img.id, ...img.data() })) as ProductImage[];

        productsData.push({
          id: docSnap.id,
          ...data,
          images: imagesData,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Product);
      }

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching seller products:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  async function createProduct(product: Partial<Product>, images?: File[]) {
    const currentUser = auth.currentUser;
    if (!currentUser) return { error: 'Not authenticated' };

    try {
      const slug = product.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const productRef = await addDoc(collection(db, 'products'), {
        name: product.name,
        slug,
        description: product.description || '',
        price: product.price,
        quantity: product.quantity || 0,
        category_id: product.category_id || null,
        seller_id: currentUser.uid,
        is_active: true,
        is_featured: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const imageRef = ref(storage, `products/${productRef.id}/${Date.now()}_${i}_${file.name}`);
          await uploadBytes(imageRef, file);
          const url = await getDownloadURL(imageRef);
          await addDoc(collection(db, 'product_images'), {
            product_id: productRef.id,
            url,
            alt_text: product.name,
            is_primary: i === 0,
            display_order: i,
            created_at: serverTimestamp(),
          });
        }
      }

      await fetchSellerProducts();
      return { data: { id: productRef.id } };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async function updateProduct(id: string, data: Partial<Product>, newImages?: File[]) {
    try {
      const updateData: any = { ...data, updated_at: serverTimestamp() };
      delete updateData.id;
      delete updateData.images;

      await updateDoc(doc(db, 'products', id), updateData);

      if (newImages && newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          const file = newImages[i];
          const imageRef = ref(storage, `products/${id}/${Date.now()}_${i}_${file.name}`);
          await uploadBytes(imageRef, file);
          const url = await getDownloadURL(imageRef);
          await addDoc(collection(db, 'product_images'), {
            product_id: id,
            url,
            alt_text: data.name,
            is_primary: false,
            display_order: Date.now() + i,
            created_at: serverTimestamp(),
          });
        }
      }

      await fetchSellerProducts();
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async function deleteProduct(id: string) {
    try {
      const imagesRef = collection(db, 'product_images');
      const q = query(imagesRef, where('product_id', '==', id));
      const imagesSnap = await getDocs(q);

      for (const img of imagesSnap.docs) {
        const imgData = img.data();
        if (imgData.url) {
          try {
            const imageRef = ref(storage, imgData.url);
            await deleteObject(imageRef);
          } catch {}
        }
        await deleteDoc(img.ref);
      }

      await deleteDoc(doc(db, 'products', id));
      await fetchSellerProducts();
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  }

  return { products, loading, createProduct, updateProduct, deleteProduct, refetch: fetchSellerProducts };
}

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const imageRef = ref(storage, `products/${productId}/${Date.now()}_${file.name}`);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);

  await addDoc(collection(db, 'product_images'), {
    product_id: productId,
    url,
    alt_text: '',
    is_primary: false,
    display_order: Date.now(),
    created_at: serverTimestamp(),
  });

  return url;
}

export async function deleteProductImage(imageId: string, url: string) {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch {}

  await deleteDoc(doc(db, 'product_images', imageId));
}
