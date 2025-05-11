// src/components/SettingsPage.tsx
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../core-ui';
import { Input } from '../components';
import { invoke } from '@tauri-apps/api/core';
import {
  getInitialTheme,
  saveTheme,
  SPOTIFY_MONITOR_KEY,
  toggleSpotifyMonitor,
  toggleCallMonitor,
  CALL_MONITOR_KEY,
} from '../utils';

type SettingsTabKey = 'generali';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState('utente123');
  const [spotifyMonitor, setSpotifyMonitor] = useState(false);
  const [callMonitor, setCallMonitor] = useState(false);

  function apriAccessibilita() {
    invoke('open_accessibility_settings');
  }

  useEffect(() => {
    const savedTheme = getInitialTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    setDarkMode(savedTheme === 'dark');

    const savedSpotifyMonitor = localStorage.getItem(SPOTIFY_MONITOR_KEY);
    setSpotifyMonitor(savedSpotifyMonitor === 'true');

    const savedCallMonitor = localStorage.getItem(CALL_MONITOR_KEY);
    setCallMonitor(savedCallMonitor === 'true');
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') as 'light' | 'dark';
    const next = current === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', next);
    saveTheme(next);
  };

  return (
    <div className='p-6 pt-0 max-w-3xl mx-auto'>
      <Tabs<SettingsTabKey> defaultValue='generali' className='w-full'>
        <TabsList className='mb-4 bg-card text-card-foreground border border-border rounded-lg pl-2 pb-1 pr-2'>
          <TabsTrigger<SettingsTabKey> value='generali'>Generali</TabsTrigger>
          {/* <TabsTrigger value='account'>Account</TabsTrigger>
          <TabsTrigger value='avanzate'>Avanzate</TabsTrigger> */}
        </TabsList>

        <TabsContent<SettingsTabKey> value='generali'>
          <Card>
            <CardContent className='p-6 space-y-6'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='dark-mode'>Modalità scura</Label>
                <Switch
                  id='dark-mode'
                  checked={darkMode}
                  onCheckedChange={() => {
                    toggleTheme();
                    setDarkMode(!darkMode);
                  }}
                />
              </div>

              <div className='flex items-center justify-between'>
                <Label htmlFor='spotify-monitor'>Spotify Adv Monitor</Label>
                <Switch
                  id='spotify-monitor'
                  checked={spotifyMonitor}
                  onCheckedChange={() => {
                    toggleSpotifyMonitor(!spotifyMonitor);
                    setSpotifyMonitor(!spotifyMonitor);
                  }}
                />
              </div>

              <div className='flex items-center justify-between'>
                <Label htmlFor='call-monitor'>Call Adv Monitor</Label>
                <Switch
                  id='call-monitor'
                  checked={callMonitor}
                  onCheckedChange={() => {
                    toggleCallMonitor(!callMonitor);
                    setCallMonitor(!callMonitor);
                  }}
                />
              </div>

              <hr className='text-sm text-muted-foreground' />

              <div className=''>
                <Button className='text-sm' onClick={() => apriAccessibilita()}>
                  Apri impostazioni accessibilità
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='account'>
          <Card>
            <CardContent className='p-6 space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='username'>Nome utente</Label>
                <Input
                  id='username'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='avanzate'>
          <Card>
            <CardContent className='p-6'>
              <p className='text-sm text-muted-foreground'>
                Qui puoi configurare impostazioni avanzate dell'applicazione.
                (Placeholder)
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
