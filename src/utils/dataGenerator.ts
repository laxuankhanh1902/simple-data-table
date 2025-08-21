import type { DataRow } from '../types';

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Anna', 'Robert', 'Lisa', 'James', 'Maria', 'William', 'Jennifer', 'Daniel', 'Linda'];
const lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis'];
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'NC', 'IN', 'WA', 'CO', 'GA', 'MI', 'OR', 'NV'];
const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'Brazil'];
const tags = ['premium', 'verified', 'new', 'returning', 'vip', 'beta', 'mobile', 'desktop', 'enterprise', 'starter', 'pro', 'trial'];
const permissions = ['read', 'write', 'admin', 'delete', 'create', 'update', 'export', 'import', 'share', 'publish'];
const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
const oses = ['Windows 10', 'Windows 11', 'macOS', 'Ubuntu', 'iOS', 'Android'];
const sources = ['google', 'facebook', 'twitter', 'email', 'direct', 'organic'];
const mediums = ['cpc', 'email', 'social', 'referral', 'organic'];
const campaigns = ['summer_sale', 'black_friday', 'new_year', 'spring_promo', 'back_to_school'];

const products = [
  { id: 'prod_001', name: 'Wireless Headphones', category: 'Electronics', price: 199.99 },
  { id: 'prod_002', name: 'Smart Watch', category: 'Electronics', price: 299.99 },
  { id: 'prod_003', name: 'Laptop Stand', category: 'Office', price: 79.99 },
  { id: 'prod_004', name: 'Coffee Mug', category: 'Kitchen', price: 24.99 },
  { id: 'prod_005', name: 'Yoga Mat', category: 'Fitness', price: 49.99 },
  { id: 'prod_006', name: 'Book Light', category: 'Reading', price: 34.99 },
  { id: 'prod_007', name: 'Phone Case', category: 'Electronics', price: 19.99 },
  { id: 'prod_008', name: 'Water Bottle', category: 'Sports', price: 29.99 },
];

const socialPlatforms = ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'youtube'];
const locationTypes = ['restaurant', 'shop', 'park', 'gym', 'cafe', 'hospital', 'school'];
const hashtags = ['#tech', '#lifestyle', '#work', '#fitness', '#food', '#travel', '#art', '#music', '#business', '#health'];
const errorTypes = ['TypeError', 'ReferenceError', 'NetworkError', 'ValidationError', 'TimeoutError'];
const eventTypes = ['click', 'scroll', 'hover', 'form_submit', 'page_view', 'download', 'search'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomElements = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateRandomIP = (): string => {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
};

const generateRandomDate = (daysBack: number = 30): string => {
  const now = new Date();
  const past = new Date(now.getTime() - (Math.random() * daysBack * 24 * 60 * 60 * 1000));
  return past.toISOString();
};

const generateComplexGeolocation = () => {
  const lat = (Math.random() - 0.5) * 180;
  const lng = (Math.random() - 0.5) * 360;
  
  // Create Map for address components
  const components = new Map<string, string>();
  components.set('street_number', String(Math.floor(Math.random() * 9999) + 1));
  components.set('route', getRandomElement(['Main St', 'Oak Ave', 'Pine Rd', 'Broadway', 'First Ave']));
  components.set('locality', getRandomElement(cities));
  components.set('administrative_area_level_1', getRandomElement(states));
  components.set('country', getRandomElement(countries));
  components.set('postal_code', String(Math.floor(Math.random() * 90000) + 10000));

  return {
    coordinates: { latitude: lat, longitude: lng },
    address: {
      formatted: `${components.get('street_number')} ${components.get('route')}, ${components.get('locality')}, ${components.get('administrative_area_level_1')}`,
      components: components,
    },
    timezone: {
      name: getRandomElement(['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']),
      offset: getRandomElement(['-05:00', '-06:00', '-07:00', '-08:00', '+00:00', '+09:00']),
      dst: Math.random() > 0.5,
    },
    nearby: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
      name: `${getRandomElement(['Starbucks', 'McDonalds', 'Central Park', 'City Gym', 'Main Library'])} ${Math.floor(Math.random() * 100)}`,
      type: getRandomElement(locationTypes),
      distance: Math.round(Math.random() * 2000),
      rating: Math.random() > 0.3 ? Math.round((Math.random() * 4 + 1) * 10) / 10 : undefined,
    })),
  };
};

const generateAnalytics = () => {
  const sessionsCount = Math.floor(Math.random() * 5) + 1;
  const sessions = Array.from({ length: sessionsCount }, () => {
    const sessionStart = generateRandomDate(30);
    const sessionEnd = new Date(new Date(sessionStart).getTime() + Math.random() * 3600000).toISOString();
    
    const pagesCount = Math.floor(Math.random() * 8) + 1;
    const pages = Array.from({ length: pagesCount }, () => {
      const interactions = new Map<string, number>();
      interactions.set('clicks', Math.floor(Math.random() * 20));
      interactions.set('scrolls', Math.floor(Math.random() * 50));
      interactions.set('hovers', Math.floor(Math.random() * 30));
      
      return {
        url: `/${getRandomElement(['home', 'products', 'about', 'contact', 'blog', 'profile'])}`,
        title: `${getRandomElement(['Home', 'Products', 'About Us', 'Contact', 'Blog', 'User Profile'])} - Site`,
        timeSpent: Math.floor(Math.random() * 300),
        interactions: interactions,
      };
    });

    return {
      sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
      startTime: sessionStart,
      endTime: sessionEnd,
      pages: pages,
      events: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, () => ({
        type: getRandomElement(eventTypes),
        timestamp: generateRandomDate(1),
        data: {
          element: getRandomElement(['button', 'link', 'form', 'image']),
          value: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : getRandomElement(['signup', 'purchase', 'download']),
          metadata: { source: getRandomElement(['organic', 'paid', 'social']) }
        },
      })),
    };
  });

  const metrics = new Map<string, number>();
  metrics.set('page_load_time', Math.round(Math.random() * 3000));
  metrics.set('bounce_rate', Math.round(Math.random() * 100));
  metrics.set('conversion_rate', Math.round(Math.random() * 15 * 100) / 100);
  metrics.set('session_duration', Math.round(Math.random() * 1800));

  return {
    sessions: sessions,
    performance: {
      metrics: metrics,
      errors: Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
        type: getRandomElement(errorTypes),
        message: `${getRandomElement(['Cannot read property', 'Network request failed', 'Invalid input'])} in component`,
        stackTrace: [
          'at Component.render (Component.js:42:15)',
          'at ReactDOM.render (react-dom.js:1234:20)',
          'at App.js:15:8'
        ],
        timestamp: generateRandomDate(7),
      })),
    },
  };
};

const generateEcommerce = () => {
  const ordersCount = Math.floor(Math.random() * 4) + 1;
  const orders = Array.from({ length: ordersCount }, () => {
    const orderItems = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => {
      const product = getRandomElement(products);
      const attributes = new Map<string, string>();
      attributes.set('color', getRandomElement(['red', 'blue', 'black', 'white', 'green']));
      attributes.set('size', getRandomElement(['S', 'M', 'L', 'XL', 'One Size']));
      
      return {
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: Math.floor(Math.random() * 3) + 1,
        attributes: attributes,
      };
    });

    return {
      orderId: `ord_${Math.random().toString(36).substr(2, 8)}`,
      date: generateRandomDate(90),
      total: orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      items: orderItems,
      shipping: {
        method: getRandomElement(['standard', 'express', 'overnight']),
        cost: Math.round(Math.random() * 25 * 100) / 100,
        tracking: `TRK${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
        address: {
          street: `${Math.floor(Math.random() * 999)} ${getRandomElement(['Oak St', 'Pine Ave', 'Elm Dr'])}`,
          city: getRandomElement(cities),
          state: getRandomElement(states),
          zip: String(Math.floor(Math.random() * 90000) + 10000),
        },
      },
      payment: {
        method: getRandomElement(['credit_card', 'debit_card', 'paypal', 'apple_pay']),
        cardLast4: Math.random() > 0.5 ? String(Math.floor(Math.random() * 9000) + 1000) : undefined,
        transactionId: `txn_${Math.random().toString(36).substr(2, 12)}`,
      },
    };
  });

  const recommendations = new Map<string, Array<{ productId: string; score: number; reason: string; }>>();
  recommendations.set('trending', products.slice(0, 3).map(p => ({
    productId: p.id,
    score: Math.round(Math.random() * 100),
    reason: 'Popular among similar users',
  })));
  recommendations.set('related', products.slice(3, 6).map(p => ({
    productId: p.id,
    score: Math.round(Math.random() * 100),
    reason: 'Based on your recent purchases',
  })));

  const wishlist = new Set<string>();
  getRandomElements(products, Math.floor(Math.random() * 4) + 1).forEach(p => wishlist.add(p.id));

  return { orders, recommendations, wishlist };
};

const generateSocial = () => {
  const connections = new Map();
  Array.from({ length: Math.floor(Math.random() * 10) + 5 }, () => {
    const userId = `user_${Math.random().toString(36).substr(2, 8)}`;
    connections.set(userId, {
      platform: getRandomElement(socialPlatforms),
      userId: userId,
      connectionType: getRandomElement(['friend', 'follower', 'following']),
      since: generateRandomDate(365),
      interactions: Math.floor(Math.random() * 100),
    });
  });

  const posts = Array.from({ length: Math.floor(Math.random() * 8) + 2 }, () => {
    const postHashtags = new Set<string>();
    getRandomElements(hashtags, Math.floor(Math.random() * 4) + 1).forEach(tag => postHashtags.add(tag));
    
    return {
      postId: `post_${Math.random().toString(36).substr(2, 10)}`,
      platform: getRandomElement(socialPlatforms),
      content: `Check out this amazing ${getRandomElement(['product', 'experience', 'moment', 'discovery'])}! ${Array.from(postHashtags).slice(0, 2).join(' ')}`,
      timestamp: generateRandomDate(30),
      engagement: {
        likes: Math.floor(Math.random() * 500),
        shares: Math.floor(Math.random() * 50),
        comments: Array.from({ length: Math.floor(Math.random() * 8) }, () => ({
          id: `comment_${Math.random().toString(36).substr(2, 8)}`,
          author: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
          content: getRandomElement(['Great post!', 'Love this!', 'Thanks for sharing', 'Interesting perspective']),
          timestamp: generateRandomDate(7),
          replies: Math.random() > 0.7 ? [{ id: 'reply_1', author: 'User', content: 'Thanks!' }] : undefined,
        })),
      },
      hashtags: postHashtags,
      mentions: getRandomElements([`@${getRandomElement(firstNames)}`, `@${getRandomElement(lastNames)}`], Math.floor(Math.random() * 3)),
    };
  });

  const influenceCategories = new Map<string, number>();
  influenceCategories.set('technology', Math.round(Math.random() * 100));
  influenceCategories.set('lifestyle', Math.round(Math.random() * 100));
  influenceCategories.set('business', Math.round(Math.random() * 100));
  influenceCategories.set('entertainment', Math.round(Math.random() * 100));

  return {
    connections,
    posts,
    influence: {
      score: Math.round(Math.random() * 1000),
      categories: influenceCategories,
      reach: {
        followers: Math.floor(Math.random() * 10000) + 100,
        avgEngagement: Math.round(Math.random() * 15 * 100) / 100,
        topPosts: posts.slice(0, 3).map(p => p.postId),
      },
    },
  };
};

export const generateFakeData = (count: number = 50): DataRow[] => {
  const data: DataRow[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'example.org'])}`;
    
    // Generate custom fields Map
    const customFields = new Map<string, any>();
    customFields.set('loyaltyPoints', Math.floor(Math.random() * 10000));
    customFields.set('referralCode', `REF_${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
    customFields.set('apiKeys', Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
      name: getRandomElement(['production', 'staging', 'development']),
      key: `ak_${Math.random().toString(36).substr(2, 32)}`,
      permissions: getRandomElements(['read', 'write', 'admin'], Math.floor(Math.random() * 3) + 1),
    })));
    customFields.set('integrations', {
      slack: { enabled: Math.random() > 0.5, webhook: `https://hooks.slack.com/services/${Math.random().toString(36).substr(2, 10)}` },
      discord: { enabled: Math.random() > 0.7, userId: Math.random().toString(36).substr(2, 18) },
      zapier: { enabled: Math.random() > 0.6, zapCount: Math.floor(Math.random() * 20) }
    });
    
    const row: DataRow = {
      id: `user_${String(i + 1).padStart(3, '0')}`,
      timestamp: generateRandomDate(60),
      status: getRandomElement(['active', 'inactive', 'pending', 'suspended']),
      priority: getRandomElement(['low', 'medium', 'high', 'critical']),
      score: Math.floor(Math.random() * 1000),
      revenue: Math.round((Math.random() * 10000) * 100) / 100,
      user: {
        name: `${firstName} ${lastName}`,
        email: email,
        avatar: Math.random() > 0.3 ? `https://i.pravatar.cc/150?u=${email}` : undefined,
        profile: {
          age: Math.floor(Math.random() * 50) + 18,
          settings: {
            theme: getRandomElement(['light', 'dark']),
            notifications: Math.random() > 0.3,
            language: getRandomElement(['en', 'es', 'fr', 'de', 'it', 'pt']),
            preferences: {
              autoSave: Math.random() > 0.5,
              showAdvanced: Math.random() > 0.7,
              defaultView: getRandomElement(['grid', 'list', 'card', 'table']),
            },
          },
        },
        address: {
          street: `${Math.floor(Math.random() * 9999)} ${getRandomElement(['Main St', 'Oak Ave', 'Pine Rd', 'Elm Way', 'Maple Dr', 'Cedar Ln'])}`,
          city: getRandomElement(cities),
          state: getRandomElement(states),
          country: getRandomElement(countries),
          zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        },
      },
      activity: {
        type: getRandomElement(['login', 'logout', 'purchase', 'view', 'click', 'share']),
        ip: generateRandomIP(),
        location: `${getRandomElement(cities)}, ${getRandomElement(states)}`,
        duration: Math.random() > 0.5 ? Math.floor(Math.random() * 3600) : undefined,
        device: {
          type: getRandomElement(['desktop', 'mobile', 'tablet']),
          browser: getRandomElement(browsers),
          os: getRandomElement(oses),
        },
      },
      tags: getRandomElements(tags, Math.floor(Math.random() * 4) + 1),
      permissions: getRandomElements(permissions, Math.floor(Math.random() * 5) + 2),
      metadata: {
        source: getRandomElement(['web', 'mobile', 'api', 'import']),
        campaign: Math.random() > 0.4 ? getRandomElement(campaigns) : undefined,
        referrer: Math.random() > 0.6 ? getRandomElement(['google.com', 'facebook.com', 'twitter.com', 'linkedin.com']) : undefined,
        utm: {
          source: Math.random() > 0.5 ? getRandomElement(sources) : undefined,
          medium: Math.random() > 0.5 ? getRandomElement(mediums) : undefined,
          campaign: Math.random() > 0.6 ? getRandomElement(campaigns) : undefined,
          term: Math.random() > 0.8 ? getRandomElement(['react', 'vue', 'angular', 'javascript', 'typescript']) : undefined,
        },
        features: {
          betaUser: Math.random() > 0.8,
          premiumTier: getRandomElement(['free', 'starter', 'pro', 'enterprise']),
          lastLogin: generateRandomDate(7),
        },
      },
      categories: {
        primary: getRandomElement(['Technology', 'Business', 'Education', 'Healthcare', 'Finance', 'Retail', 'Entertainment']),
        secondary: getRandomElements(['Web Development', 'Mobile Apps', 'Data Analysis', 'Machine Learning', 'DevOps', 'Security', 'UI/UX', 'Marketing'], Math.floor(Math.random() * 3) + 1),
      },
      isVerified: Math.random() > 0.4,
      lastUpdated: generateRandomDate(14),
      geolocation: generateComplexGeolocation(),
      analytics: generateAnalytics(),
      ecommerce: generateEcommerce(),
      social: generateSocial(),
      customFields: customFields,
    };

    data.push(row);
  }

  return data;
};