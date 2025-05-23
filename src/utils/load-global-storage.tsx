import { invoke } from '@tauri-apps/api/core';
import { getInitialTheme } from './theme-storage';

export const SPOTIFY_MONITOR_KEY = 'spotify-monitor';
export const toggleSpotifyMonitor = (checked: boolean) => {
  localStorage.setItem(SPOTIFY_MONITOR_KEY, checked.toString());
  invoke('set_spotify_monitoring_state', { state: checked });
};

export const toggleInitialSpotifyMonitor = () => {
  const savedSpotifyMonitor = localStorage.getItem(SPOTIFY_MONITOR_KEY);
  invoke('set_spotify_monitoring_state', {
    state: savedSpotifyMonitor === 'true',
  });
};

export const toggleInitialTheme = () => {
  const savedTheme = getInitialTheme();
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
};
