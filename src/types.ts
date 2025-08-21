export interface UserProfile {
  age: number;
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
    preferences: {
      autoSave: boolean;
      showAdvanced: boolean;
      defaultView: string;
    };
  };
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  profile: UserProfile;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export interface Activity {
  type: 'login' | 'logout' | 'purchase' | 'view' | 'click' | 'share';
  ip: string;
  location: string;
  duration?: number;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
  };
}

export interface Metadata {
  source: 'web' | 'mobile' | 'api' | 'import';
  campaign?: string;
  referrer?: string;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
  };
  features: {
    betaUser: boolean;
    premiumTier: string;
    lastLogin: string;
  };
}

export interface DataRow {
  id: string;
  timestamp: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  revenue: number;
  user: User;
  activity: Activity;
  tags: string[];
  permissions: string[];
  metadata: Metadata;
  categories: {
    primary: string;
    secondary: string[];
  };
  isVerified: boolean;
  lastUpdated: string;
  geolocation: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    address: {
      formatted: string;
      components: Map<string, string>;
    };
    timezone: {
      name: string;
      offset: string;
      dst: boolean;
    };
    nearby: Array<{
      name: string;
      type: string;
      distance: number;
      rating?: number;
    }>;
  };
  analytics: {
    sessions: Array<{
      sessionId: string;
      startTime: string;
      endTime: string;
      pages: Array<{
        url: string;
        title: string;
        timeSpent: number;
        interactions: Map<string, number>;
      }>;
      events: Array<{
        type: string;
        timestamp: string;
        data: Record<string, any>;
      }>;
    }>;
    performance: {
      metrics: Map<string, number>;
      errors: Array<{
        type: string;
        message: string;
        stackTrace: string[];
        timestamp: string;
      }>;
    };
  };
  ecommerce: {
    orders: Array<{
      orderId: string;
      date: string;
      total: number;
      items: Array<{
        productId: string;
        name: string;
        category: string;
        price: number;
        quantity: number;
        attributes: Map<string, string>;
      }>;
      shipping: {
        method: string;
        cost: number;
        tracking: string;
        address: Record<string, string>;
      };
      payment: {
        method: string;
        cardLast4?: string;
        transactionId: string;
      };
    }>;
    recommendations: Map<string, Array<{
      productId: string;
      score: number;
      reason: string;
    }>>;
    wishlist: Set<string>;
  };
  social: {
    connections: Map<string, {
      platform: string;
      userId: string;
      connectionType: 'friend' | 'follower' | 'following';
      since: string;
      interactions: number;
    }>;
    posts: Array<{
      postId: string;
      platform: string;
      content: string;
      timestamp: string;
      engagement: {
        likes: number;
        shares: number;
        comments: Array<{
          id: string;
          author: string;
          content: string;
          timestamp: string;
          replies?: Array<any>;
        }>;
      };
      hashtags: Set<string>;
      mentions: string[];
    }>;
    influence: {
      score: number;
      categories: Map<string, number>;
      reach: {
        followers: number;
        avgEngagement: number;
        topPosts: string[];
      };
    };
  };
  customFields: Map<string, any>;
}

export interface Filter {
  id: string;
  field: string;
  value: any;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'range';
  label?: string;
}

export interface ColumnConfig {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  fixed?: boolean;
}