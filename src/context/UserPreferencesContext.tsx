'use client';

import * as React from 'react';

type ThemeType = 'dark-green' | 'mint-green' | 'lime-green' | 'blue-default';

interface UserPreferencesContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  affiliateEnabled: boolean;
  setAffiliateEnabled: (enabled: boolean) => void;
}

const UserPreferencesContext = React.createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeType>('dark-green');
  const [affiliateEnabled, setAffiliateEnabled] = React.useState<boolean>(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('user-theme') as ThemeType;
    if (savedTheme) setThemeState(savedTheme);

    const savedAffiliate = localStorage.getItem('affiliate-enabled');
    if (savedAffiliate !== null) setAffiliateEnabled(savedAffiliate === 'true');
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('user-theme', newTheme);
    
    // Apply theme to body for global styling
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const updateAffiliate = (enabled: boolean) => {
    setAffiliateEnabled(enabled);
    localStorage.setItem('affiliate-enabled', String(enabled));
  };

  // Effect to apply initial theme
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <UserPreferencesContext.Provider value={{ theme, setTheme, affiliateEnabled, setAffiliateEnabled: updateAffiliate }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = React.useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
