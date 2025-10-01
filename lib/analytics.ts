import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';

// Analytics utility functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && analytics) {
    try {
      logEvent(analytics, eventName, parameters);
      console.log('📊 Analytics Event:', eventName, parameters);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }
};

// Common events
export const trackMultisigCreated = (method: 'SOL' | 'NVAI', memberCount: number) => {
  trackEvent('multisig_created', {
    method,
    member_count: memberCount,
    timestamp: Date.now()
  });
};

export const trackTransactionApproved = (transactionType: string) => {
  trackEvent('transaction_approved', {
    transaction_type: transactionType,
    timestamp: Date.now()
  });
};

export const trackTransactionExecuted = (transactionType: string, success: boolean) => {
  trackEvent('transaction_executed', {
    transaction_type: transactionType,
    success,
    timestamp: Date.now()
  });
};

export const trackWalletConnected = (walletName: string) => {
  trackEvent('wallet_connected', {
    wallet_name: walletName,
    timestamp: Date.now()
  });
};

export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_name: pageName,
    timestamp: Date.now()
  });
};

export const trackError = (errorType: string, errorMessage: string, context?: string) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    context,
    timestamp: Date.now()
  });
};

export const trackUserAction = (action: string, details?: Record<string, any>) => {
  trackEvent('user_action', {
    action,
    ...details,
    timestamp: Date.now()
  });
};
