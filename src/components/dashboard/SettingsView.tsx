'use client';

import React from 'react';
import { ProfileView } from './ProfileView';
import { Trade } from '../../types/trade';

interface SettingsViewProps {
  trades?: Trade[];
  onResetSampleData?: () => void;
  onClearAllTrades?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
  return <ProfileView />;
};
