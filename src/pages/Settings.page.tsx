// src/components/SettingsPage.tsx
import { useState } from 'react';
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

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState('utente123');

  function apriAccessibilita() {
    invoke('open_accessibility_settings');
  }

  return (
    <div className='p-6 pt-0 max-w-3xl mx-auto'>
      <Tabs defaultValue='generali' className='w-full'>
        <TabsList className='mb-4'>
          <TabsTrigger value='generali'>Generali</TabsTrigger>
          <TabsTrigger value='account'>Account</TabsTrigger>
          <TabsTrigger value='avanzate'>Avanzate</TabsTrigger>
        </TabsList>

        <TabsContent value='generali'>
          <Card>
            <CardContent className='p-6 space-y-6'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='dark-mode'>Modalità scura</Label>
                <Switch
                  id='dark-mode'
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>

              <div className='pt-4'>
                <button
                  onClick={() => {
                    // azione qui, es: apri una modale, o naviga, o chiama invoke
                    console.log('Accessibilità aperta');
                    apriAccessibilita();
                  }}
                  className='px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition'>
                  Apri impostazioni accessibilità
                </button>
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
