import { useState, useEffect, useCallback } from 'react';
import {
  Excalidraw,
  MainMenu,
  WelcomeScreen,
  serializeAsJSON,
  exportToBlob,
  exportToSvg,
  // exportToClipboard,
} from '@excalidraw/excalidraw';
import {
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from '@excalidraw/excalidraw/types/types';
import { Button, Card, CardContent, useToast } from '../core-ui';
import { Input } from '../components';
import {
  ArrowLeft,
  DownloadIcon,
  ImportIcon,
  Maximize,
  Minimize,
  PlusSquareIcon,
  Save,
  TrashIcon,
} from 'lucide-react';
import {
  currentMonitor,
  getCurrentWindow,
  PhysicalPosition,
  PhysicalSize,
} from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { v4 as uuidv4 } from 'uuid';
import { ask, save } from '@tauri-apps/plugin-dialog';
import { pickFile } from '../utils';

interface Project {
  id: string;
  name: string;
  data?: string | null;
}

export function DrawingsPage() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState<string>('');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const { showToast } = useToast();

  function getFirstData() {
    invoke('load_drawing_files').then((data) => {
      let projects = data as Project[];
      projects = projects.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );
      setProjects(projects as Project[]);
    });
  }
  useEffect(() => {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

    getFirstData();
    resizeToCurrentMonitorPercent(0.75);
  }, []);

  const saveProjects = async (item: Project, data: string) => {
    await invoke('save_drawing_data', {
      name: item.name,
      id: item.id,
      data: data,
    });
    getFirstData();
  };

  const handleSave = useCallback(async () => {
    if (!currentProject || !excalidrawAPI) return;

    const elements = serializeAsJSON(
      excalidrawAPI.getSceneElements(),
      excalidrawAPI.getAppState(),
      excalidrawAPI.getFiles(),
      'local'
    );

    const updatedProject: Project = {
      ...currentProject,
      name: currentProject.name,
    };

    await saveProjects(updatedProject, elements);
    setHasChanges(false);

    showToast('Progetto salvato!', 'success');
  }, [currentProject, excalidrawAPI, projects]);

  const handleDelete = async (id: string) => {
    const answer = await ask(`Cancellare l'elemento?`, {
      title: 'Delete',
      kind: 'warning',
    });
    if (!answer) return;
    invoke('clear_single_drawing_file', { id: id }).then(() => {
      getFirstData();
    });
  };

  const handleBackToList = () => {
    if (hasChanges) {
      const confirm = window.confirm(
        'Hai delle modifiche non salvate. Vuoi salvarle prima di uscire?'
      );
      if (confirm) handleSave();
    }
    setCurrentProject(null);
    setName('');
    setHasChanges(false);
    setIsFullscreen(false);
  };

  const handleCreateNew = async (
    project: {
      name: string;
      data?: string | null;
    },
    select: boolean
  ) => {
    if (!project.name.trim()) return;
    const newProject: Project = {
      id: uuidv4(),
      name: project.name.trim(),
      data: project.data,
    };
    await saveProjects(newProject, '');
    if (select) handleProjectSelection(newProject);
    setName('');
    return newProject;
  };

  const handleFullscreen = async () => {
    if (isFullscreen) {
      await resizeToCurrentMonitorPercent(0.75);
      setIsFullscreen(false);
    } else {
      await resizeToCurrentMonitorPercent(0.95);
      setIsFullscreen(true);
    }
  };

  const handleProjectSelection = async (project: Project) => {
    invoke('read_data_single_drawing_file', {
      id: project.id,
    }).then(async (data) => {
      project.data = data as string;
      setCurrentProject(project);
      setName(project.name);
    });
  };

  const handleExportToPng = async () => {
    if (!excalidrawAPI || !currentProject) return;
    const path = await save({
      defaultPath: `${sanitizeFileName(currentProject)}.png`,
    });
    if (!path) return;
    const blob = await exportToBlob({
      elements: excalidrawAPI.getSceneElements(),
      mimeType: 'image/png',
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
    });
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    await invoke('save_drawing_to_file', {
      path: path,
      data: Array.from(uint8Array), // converte in array serializzabile
    });
  };

  const handleExportToSvg = async () => {
    // https://github.com/naotsugu/excalidraw-app/blob/main/src/App.tsx#L7
    if (!excalidrawAPI || !currentProject) return;
    const path = await save({
      defaultPath: `${sanitizeFileName(currentProject)}.svg`,
    });
    if (!path) return;
    const svg = await exportToSvg({
      elements: excalidrawAPI.getSceneElements(),
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
    });
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(svg.outerHTML);

    await invoke('save_drawing_to_file', {
      path: path,
      data: Array.from(uint8Array), // converte in array serializzabile
    });
  };

  const handleExportToJson = async (project: Project) => {
    invoke('read_data_single_drawing_file', {
      id: project.id,
    }).then(async (json) => {
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(json as string);
      const path = await save({
        defaultPath: `${sanitizeFileName(project)}.json`,
      });
      if (!path) return;
      await invoke('save_drawing_to_file', {
        path: path,
        data: Array.from(uint8Array), // converte in array serializzabile
      });
    });
  };

  const handleImportJson = async () => {
    const selected = await pickFile({
      multiple: false,
      extensions: ['json'],
      saveToRecent: false,
    });

    const data = await invoke('read_json_drawing_file', {
      path: selected?.path?.[0],
    });
    const currentTimpestamp = new Date().getTime();
    const projectCreated = await handleCreateNew(
      { name: `import_${currentTimpestamp}`, data: data as string },
      false
    );
    if (projectCreated) {
      await saveProjects(projectCreated, data as string);
      await handleProjectSelection(projectCreated);
    }
  };

  return (
    <div className='p-2 bg-background text-foreground min-h-screen'>
      {!currentProject && (
        <>
          <div className='mb-4 flex gap-4 items-center'>
            <Button
              onClick={handleImportJson}
              variant='ghost'
              title='Import json'>
              <ImportIcon className='w-5 h-5' />
            </Button>
            <Input
              placeholder='Nome nuovo progetto'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-1/3'
            />
            <Button
              onClick={() => handleCreateNew({ name }, true)}
              variant='ghost'
              title='Crea Nuovo'>
              <PlusSquareIcon className='w-5 h-5' />
            </Button>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
            {projects.map((project) => (
              <Card
                key={project.id}
                className='bg-muted text-muted-foreground hover:shadow-lg cursor-pointer'>
                <CardContent
                  className='p-4 h-full flex flex-col justify-between'
                  onClick={() => handleProjectSelection(project)}>
                  <div className='mb-4 break-words max-w-full whitespace-pre-wrap'>
                    {project.name}
                  </div>
                  <div className='flex justify-end gap-2 mt-auto'>
                    <Button
                      variant='ghost'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportToJson(project);
                      }}
                      title='Download'>
                      <DownloadIcon className='w-5 h-5' />
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      title='Cancella'>
                      <TrashIcon className='w-5 h-5' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {currentProject && (
        <div>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2 p-2'>
                <Button
                  variant='ghost'
                  onClick={handleBackToList}
                  title='Torna alla lista'>
                  <ArrowLeft className='w-5 h-5' />
                </Button>
                <Button
                  variant='ghost'
                  onClick={handleSave}
                  title='Salva progetto'>
                  <Save className='w-5 h-5' />
                </Button>
                <Button
                  variant='ghost'
                  onClick={() => handleFullscreen()}
                  title={isFullscreen ? 'Riduci' : 'Ingrandisci'}>
                  {isFullscreen ? (
                    <Minimize className='w-5 h-5' />
                  ) : (
                    <Maximize className='w-5 h-5' />
                  )}
                </Button>
              </div>
            </div>
            <Input
              placeholder='Nome nuovo progetto'
              value={currentProject.name}
              onChange={(e) =>
                handleProjectSelection({
                  ...currentProject,
                  name: e.target.value,
                })
              }
              className='w-1/3'
            />
          </div>

          <div
            className={`bg-secondary rounded-xl overflow-hidden ${
              isFullscreen
                ? 'w-screen h-[100vh] fixed top-0 left-0 z-50'
                : 'w-full h-[75vh] max-w-6xl mx-auto'
            }`}>
            <ExcalidrawComponent
              initialData={currentProject.data ?? ''}
              handleFullscreen={handleFullscreen}
              handleBackToList={handleBackToList}
              setExcalidrawAPI={setExcalidrawAPI}
              handleSave={handleSave}
              handleExportToPng={handleExportToPng}
              handleExportToSvg={handleExportToSvg}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ExcalidrawComponent(props: {
  initialData: string | null;
  handleFullscreen: () => void;
  handleBackToList: () => void;
  setExcalidrawAPI: (api: ExcalidrawImperativeAPI | null) => void;
  handleSave: () => void;
  handleExportToPng: () => void;
  handleExportToSvg: () => void;
}) {
  const currentTheme: ExcalidrawProps['theme'] =
    document.documentElement.getAttribute('data-theme') as 'light' | 'dark';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        props.handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [props.handleSave]);

  return (
    <Excalidraw
      ref={(api: ExcalidrawImperativeAPI) => props.setExcalidrawAPI?.(api)}
      viewModeEnabled={false}
      gridModeEnabled={false}
      onChange={(elements, state) => {
        console.log('onChange', elements, state);
      }}
      initialData={
        props.initialData ? JSON.parse(props.initialData) : undefined
      }
      UIOptions={{
        canvasActions: {
          saveToActiveFile: false, // disattiva il salvataggio predefinito
        },
      }}
      theme={currentTheme}>
      <MainMenu>
        <MainMenu.Item
          shortcut='Ctrl/Cmd+S'
          onSelect={async () => {
            props.handleSave();
          }}>
          Save
        </MainMenu.Item>
        <MainMenu.Item
          onSelect={async () => {
            props.handleExportToPng();
          }}>
          Export to png
        </MainMenu.Item>

        <MainMenu.Item
          onSelect={async () => {
            props.handleExportToSvg();
          }}>
          Export to svg
        </MainMenu.Item>

        <MainMenu.DefaultItems.LoadScene />

        <MainMenu.Item
          onSelect={async () => {
            props.handleFullscreen?.();
          }}>
          Riduci
        </MainMenu.Item>

        <MainMenu.Item
          onSelect={async () => {
            props.handleBackToList?.();
          }}>
          Torna alla lista
        </MainMenu.Item>

        {/* <MainMenu.DefaultItems.ClearCanvas />
    <MainMenu.DefaultItems.ToggleTheme /> */}
        {/* <MainMenu.DefaultItems.Help /> */}
      </MainMenu>
      <WelcomeScreen />
    </Excalidraw>
  );
}

async function resizeToCurrentMonitorPercent(value: number) {
  const monitor = await currentMonitor();
  if (!monitor) return;

  const screenWidth = monitor.size.width;
  const screenHeight = monitor.size.height;
  const screenX = monitor.position.x;
  const screenY = monitor.position.y;

  const width = Math.floor(screenWidth * value);
  const height = Math.floor(screenHeight * value);

  const x = Math.floor(screenX + (screenWidth - width) / 2);
  const y = Math.floor(screenY + (screenHeight - height) / 2);

  const window = getCurrentWindow();

  await window.setSize(new PhysicalSize(width, height));
  await window.setPosition(new PhysicalPosition(x, y));
}

function sanitizeFileName(currentProject: Project): string {
  const name = (currentProject?.name ?? '') + '_' + (currentProject?.id ?? '');

  return name
    .replace(/[\\\/:*?"<>|]/g, '') // rimuove caratteri illegali
    .replace(/\s+/g, '_') // opzionale: sostituisce spazi con _
    .trim();
}

export default DrawingsPage;
