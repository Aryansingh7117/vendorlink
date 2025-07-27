// Cart utility functions for deployment-ready cart management

export interface CartItem {
  id: string;
  name: string;
  supplier: string;
  price: number;
  unit: string;
  quantity: number;
  minOrder: number;
  available: number;
}

export const CART_STORAGE_KEY = 'vendorlink_cart';

export function getCartItems(): CartItem[] {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error loading cart:', error);
    return [];
  }
}

export function saveCartItems(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    
    // Trigger multiple events for robust cross-component updates
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new StorageEvent('storage', {
      key: CART_STORAGE_KEY,
      newValue: JSON.stringify(items),
      url: window.location.href
    }));
    
    // Delayed trigger for deployment environments
    setTimeout(() => {
      window.dispatchEvent(new Event('cartUpdated'));
    }, 100);
    
    console.log('Cart saved successfully:', items.length, 'items');
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

export function addToCart(product: any, supplierName?: string): void {
  const existingCart = getCartItems();
  
  const cartItem: CartItem = {
    id: product.id,
    name: product.name,
    supplier: supplierName || product.supplier?.businessName || "Unknown Supplier",
    price: product.pricePerUnit || product.price,
    unit: product.unit,
    quantity: product.minimumOrderQuantity || product.minOrder || 1,
    minOrder: product.minimumOrderQuantity || product.minOrder || 1,
    available: product.availableQuantity || product.available || 999
  };
  
  console.log('Adding to cart:', cartItem);
  
  // Check if item already exists in cart
  const existingItemIndex = existingCart.findIndex(item => item.id === product.id);
  if (existingItemIndex >= 0) {
    existingCart[existingItemIndex].quantity += cartItem.quantity;
  } else {
    existingCart.push(cartItem);
  }
  
  saveCartItems(existingCart);
  console.log('Cart updated. Total items:', existingCart.length);
}

export function removeFromCart(productId: string): void {
  const existingCart = getCartItems();
  const updatedCart = existingCart.filter(item => item.id !== productId);
  saveCartItems(updatedCart);
}

export function updateCartItemQuantity(productId: string, newQuantity: number): void {
  const existingCart = getCartItems();
  const updatedCart = existingCart.map(item => {
    if (item.id === productId) {
      return { ...item, quantity: Math.max(item.minOrder, Math.min(newQuantity, item.available)) };
    }
    return item;
  });
  saveCartItems(updatedCart);
}

export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event('cartUpdated'));
  console.log('Cart cleared');
}

export function getCartTotal(): number {
  const items = getCartItems();
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function getCartItemCount(): number {
  return getCartItems().length;
}