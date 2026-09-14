export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  priceNumeric: number;
  desc: string;
  features: string[];
  tablesLimit: number;
  isActive: boolean;
}

// Cache for subscription plans loaded from database
let cachedPlans: SubscriptionPlan[] = [];
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch subscription plans from API
async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const response = await fetch('/api/subscription-plans');
    if (!response.ok) throw new Error('Failed to fetch subscription plans');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
}

// Get all subscription plans
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const now = Date.now();
  if (cachedPlans.length === 0 || now - lastCacheTime > CACHE_DURATION) {
    cachedPlans = await fetchSubscriptionPlans();
    lastCacheTime = now;
  }
  return cachedPlans;
};

// Get active plans only
export const getActiveSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const response = await fetch('/api/subscription-plans/active');
    if (!response.ok) throw new Error('Failed to fetch active subscription plans');
    return await response.json();
  } catch (error) {
    console.error('Error fetching active subscription plans:', error);
    return [];
  }
};

// Get plan by ID
export const getSubscriptionPlanById = async (id: string): Promise<SubscriptionPlan | undefined> => {
  try {
    const response = await fetch(`/api/subscription-plans/${id}`);
    if (!response.ok) throw new Error('Failed to fetch subscription plan');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return undefined;
  }
};

// Set subscription plans (called from admin interface)
export const setSubscriptionPlans = async (plans: SubscriptionPlan[]): Promise<SubscriptionPlan[]> => {
  try {
    const response = await fetch('/api/subscription-plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plans })
    });
    if (!response.ok) throw new Error('Failed to save subscription plans');
    
    // Update cache
    cachedPlans = await response.json();
    lastCacheTime = Date.now();
    return cachedPlans;
  } catch (error) {
    console.error('Error saving subscription plans:', error);
    throw error;
  }
};

// Create a new subscription plan
export const createSubscriptionPlan = async (plan: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> => {
  try {
    const response = await fetch('/api/subscription-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    });
    if (!response.ok) throw new Error('Failed to create subscription plan');
    
    // Invalidate cache
    cachedPlans = [];
    lastCacheTime = 0;
    return await response.json();
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    throw error;
  }
};

// Update a subscription plan
export const updateSubscriptionPlan = async (id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
  try {
    const response = await fetch(`/api/subscription-plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update subscription plan');
    
    // Invalidate cache
    cachedPlans = [];
    lastCacheTime = 0;
    return await response.json();
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    throw error;
  }
};

// Delete a subscription plan
export const deleteSubscriptionPlan = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/subscription-plans/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete subscription plan');
    
    // Invalidate cache
    cachedPlans = [];
    lastCacheTime = 0;
    return true;
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    throw error;
  }
};
