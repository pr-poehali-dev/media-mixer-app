import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

type Section = "library" | "player" | "upload" | "bookmarks" | "profile" | "settings";
type SyncTab = "lyrics" | "chords" | "notes";

type UploadedFile = {
  id: number;
  name: string;
  size: string;
  fileType: "Аудио" | "Видео" | "Текст" | "Ноты";
  genre: string;
  url?: string;
};

const TRACKS = [
  { id: 1, title: "Весенний вечер", artist: "Алексей Краснов", duration: "3:42", genre: "Хвалы", hasLyrics: true, hasChords: true, hasNotes: false },
  { id: 2, title: "Городской ритм", artist: "Море внутри", duration: "4:15", genre: "Хвалы", hasLyrics: true, hasChords: false, hasNotes: true },
  { id: 3, title: "Тишина после", artist: "Лира", duration: "5:03", genre: "Детские хвалы", hasLyrics: false, hasChords: true, hasNotes: true },
  { id: 4, title: "Полночный бриз", artist: "Северный ветер", duration: "3:28", genre: "Детские хвалы", hasLyrics: true, hasChords: true, hasNotes: false },
  { id: 5, title: "Утро в горах", artist: "Вершина", duration: "6:11", genre: "Хвалы", hasLyrics: false, hasChords: false, hasNotes: true },
];

const LYRICS = [
  { time: 0, text: "В тихом городе засыпают фонари", chords: ["Am", "G"] },
  { time: 8, text: "И дождь тихонько бьёт по крышам", chords: ["F", "C"] },
  { time: 16, text: "Ты стоишь у окна, смотришь вдали", chords: ["Am", "Em"] },
  { time: 24, text: "И всё вокруг затихло, дышит", chords: ["F", "G"] },
  { time: 32, text: "Весенний вечер — мягкий, как молчание", chords: ["Am", "G", "F"] },
  { time: 40, text: "Звёзды падают в твои ладони", chords: ["C", "G"] },
  { time: 48, text: "Мы остались здесь — вдвоём, в туман", chords: ["Am", "F"] },
  { time: 56, text: "И больше ничего не нужно помнить", chords: ["G", "C"] },
];

const NOTES_RU = ["До", "Ре", "Ми", "Фа", "Соль", "Ля", "Си"];

function WaveformVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const heights = [4, 7, 5, 9, 6, 8, 4, 7, 5, 6, 8, 5, 7, 4, 9];
  return (
    <div className="flex items-end gap-[3px] h-10">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-accent origin-bottom"
          style={{
            height: `${h * 4}px`,
            animation: isPlaying ? `waveform ${0.8 + i * 0.07}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.05}s`,
            opacity: isPlaying ? 1 : 0.3,
            transform: isPlaying ? undefined : "scaleY(0.4)",
            transition: "opacity 0.3s, transform 0.3s",
          }}
        />
      ))}
    </div>
  );
}

function LibrarySection({ onPlay, uploadedFiles, onDeleteUploaded }: {
  onPlay: (id: number) => void;
  uploadedFiles: UploadedFile[];
  onDeleteUploaded: (id: number) => void;
}) {
  const [filter, setFilter] = useState("all");
  const [tracks, setTracks] = useState(TRACKS);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmDeleteUploaded, setConfirmDeleteUploaded] = useState<number | null>(null);
  const genres = ["all", "Хвалы", "Детские хвалы"];
  const filtered = filter === "all" ? tracks : tracks.filter(t => t.genre === filter);
  const filteredUploaded = filter === "all" ? uploadedFiles : [];

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete === id) {
      setTracks(prev => prev.filter(t => t.id !== id));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  const handleDeleteUploaded = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteUploaded === id) {
      onDeleteUploaded(id);
      setConfirmDeleteUploaded(null);
    } else {
      setConfirmDeleteUploaded(id);
    }
  };

  const fileTypeIcon: Record<string, string> = {
    "Аудио": "Music",
    "Видео": "Video",
    "Текст": "FileText",
    "Ноты": "Music2",
  };
  const fileTypeColor: Record<string, string> = {
    "Аудио": "text-accent",
    "Видео": "text-blue-400",
    "Текст": "text-yellow-400",
    "Ноты": "text-purple-400",
  };

  const totalCount = tracks.length + uploadedFiles.length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">Библиотека</h2>
        <p className="text-muted-foreground text-sm">{totalCount} файлов</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {genres.map(g => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              filter === g
                ? "bg-accent text-accent-foreground font-medium"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {g === "all" ? "Все" : g}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {filtered.map((track, idx) => (
          <div
            key={track.id}
            onClick={() => onPlay(track.id)}
            className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-all cursor-pointer"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all flex-shrink-0">
              <Icon name="Music" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{track.title}</p>
              <p className="text-muted-foreground text-xs truncate">{track.artist}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {track.hasLyrics && <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">текст</span>}
              {track.hasChords && <span className="text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded">аккорды</span>}
              {track.hasNotes && <span className="text-xs text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">ноты</span>}
              <span className="text-muted-foreground text-xs font-mono">{track.duration}</span>
              <button
                onClick={(e) => handleDelete(track.id, e)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${
                  confirmDelete === track.id
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                }`}
                title={confirmDelete === track.id ? "Нажмите ещё раз для подтверждения" : "Удалить"}
              >
                <Icon name={confirmDelete === track.id ? "Check" : "Trash2"} size={13} />
              </button>
            </div>
          </div>
        ))}

        {filteredUploaded.map((file, idx) => (
          <div
            key={`uploaded-${file.id}`}
            className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-all cursor-pointer"
            style={{ animationDelay: `${(filtered.length + idx) * 0.05}s` }}
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Icon name={fileTypeIcon[file.fileType] ?? "File"} size={16} className={fileTypeColor[file.fileType] ?? "text-muted-foreground"} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-muted-foreground text-xs truncate">{file.fileType} · {file.size}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-1.5 py-0.5 rounded ${fileTypeColor[file.fileType] ?? ""} bg-current/10`}
                style={{ backgroundColor: "transparent", border: "1px solid currentColor", opacity: 0.7 }}>
                {file.fileType.toLowerCase()}
              </span>
              <button
                onClick={(e) => handleDeleteUploaded(file.id, e)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${
                  confirmDeleteUploaded === file.id
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                }`}
                title={confirmDeleteUploaded === file.id ? "Нажмите ещё раз для подтверждения" : "Удалить"}
              >
                <Icon name={confirmDeleteUploaded === file.id ? "Check" : "Trash2"} size={13} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && filteredUploaded.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-10">Нет файлов в этой категории</p>
        )}
      </div>
    </div>
  );
}

function PlayerSection({ trackId }: { trackId: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([0]);
  const [volume, setVolume] = useState([80]);
  const [activeTab, setActiveTab] = useState<SyncTab>("lyrics");
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const track = TRACKS.find(t => t.id === trackId) || TRACKS[0];
  const totalSec = 222;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          setProgress([Math.min((next / totalSec) * 100, 100)]);
          return next > totalSec ? 0 : next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const activeLyricIdx = LYRICS.reduce((acc, l, i) => l.time <= currentTime ? i : acc, 0);

  const tabs: { id: SyncTab; label: string }[] = [
    { id: "lyrics", label: "Текст" },
    { id: "chords", label: "Аккорды" },
    { id: "notes", label: "Ноты" },
  ];

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">{track.title}</h2>
          <p className="text-muted-foreground">{track.artist}</p>
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-full px-2 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow"></span>
          <span className="text-xs text-muted-foreground">{track.genre}</span>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 mb-6 flex flex-col items-center gap-4 border border-border">
        <WaveformVisualizer isPlaying={isPlaying} />

        <div className="w-full">
          <Slider
            value={progress}
            onValueChange={setProgress}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground font-mono">
              {Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{track.duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="Shuffle" size={18} />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="SkipBack" size={22} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-accent/20"
          >
            <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="SkipForward" size={22} />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="Repeat" size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full max-w-xs">
          <Icon name="Volume2" size={16} className="text-muted-foreground flex-shrink-0" />
          <Slider value={volume} onValueChange={setVolume} max={100} className="flex-1" />
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-secondary rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-background text-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border flex-1 overflow-y-auto scrollbar-hide min-h-48">
        {activeTab === "lyrics" && (
          <div className="space-y-4">
            {LYRICS.map((line, idx) => (
              <div key={idx} className={`transition-all duration-300 ${idx === activeLyricIdx ? "active-lyric" : "inactive-lyric"}`}>
                <p className={`text-base leading-relaxed ${idx === activeLyricIdx ? "font-medium" : ""}`}>{line.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "chords" && (
          <div className="space-y-5">
            {LYRICS.map((line, idx) => (
              <div key={idx} className={`transition-all duration-300 ${idx === activeLyricIdx ? "" : "opacity-40"}`}>
                <div className="flex gap-3 mb-1">
                  {line.chords.map((chord, ci) => (
                    <span key={ci} className="font-mono text-sm font-semibold text-accent">{chord}</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{line.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm mb-4">Тональность: Am · Темп: 92 BPM</p>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {NOTES_RU.map((note, i) => (
                <div key={i} className={`text-center py-2 rounded-lg text-xs font-mono transition-all duration-300 ${
                  i === activeLyricIdx % 7 ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {note}
                </div>
              ))}
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <div className="flex gap-1 items-end h-16">
                {[3,5,4,6,5,7,4,5,6,3,5,4,7,5,4,6].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-500"
                    style={{
                      height: `${h * 8}px`,
                      background: i === activeLyricIdx % 16
                        ? "hsl(var(--accent))"
                        : "hsl(var(--border))",
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-mono">нотная запись · 2/4</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadSection({ uploadedFiles, onFilesAdded, onFileRemove }: {
  uploadedFiles: UploadedFile[];
  onFilesAdded: (files: UploadedFile[]) => void;
  onFileRemove: (id: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [acceptFilter, setAcceptFilter] = useState("audio/*,video/*,.txt,.pdf,.docx,.xml");

  const types: { icon: string; label: string; ext: string; color: string; accept: string; fileType: UploadedFile["fileType"] }[] = [
    { icon: "Music", label: "Аудио", ext: "MP3, WAV, FLAC", color: "text-accent", accept: "audio/*", fileType: "Аудио" },
    { icon: "Video", label: "Видео", ext: "MP4, MOV", color: "text-blue-400", accept: "video/*", fileType: "Видео" },
    { icon: "FileText", label: "Текст", ext: "TXT, PDF, DOCX", color: "text-yellow-400", accept: ".txt,.pdf,.docx", fileType: "Текст" },
    { icon: "Music2", label: "Ноты", ext: "MusicXML, PDF", color: "text-purple-400", accept: ".xml,.pdf", fileType: "Ноты" },
  ];

  const parseFiles = (fileList: FileList | null, fileType?: UploadedFile["fileType"]): UploadedFile[] => {
    if (!fileList) return [];
    return Array.from(fileList).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} МБ` : `${(f.size / 1024).toFixed(0)} КБ`,
      fileType: fileType ?? (f.type.startsWith("audio") ? "Аудио" : f.type.startsWith("video") ? "Видео" : "Текст"),
      genre: "",
      url: URL.createObjectURL(f),
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onFilesAdded(parseFiles(e.dataTransfer.files));
  };

  const openDialog = (accept: string) => {
    setAcceptFilter(accept);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">Загрузка</h2>
        <p className="text-muted-foreground text-sm">Добавьте аудио, видео, текст или ноты</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptFilter}
        className="hidden"
        onChange={e => { onFilesAdded(parseFiles(e.target.files)); e.target.value = ""; }}
      />

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => openDialog("audio/*,video/*,.txt,.pdf,.docx,.xml")}
        className={`border-2 border-dashed rounded-2xl p-10 text-center mb-6 transition-all cursor-pointer ${
          dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent hover:bg-accent/5"
        }`}
      >
        <div className="flex justify-center mb-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${dragging ? "bg-accent/20" : "bg-secondary"}`}>
            <Icon name="Upload" size={24} className={dragging ? "text-accent" : "text-muted-foreground"} />
          </div>
        </div>
        <p className="font-medium mb-1">Перетащите файлы сюда</p>
        <p className="text-sm text-muted-foreground mb-4">или нажмите для выбора</p>
        <span className="inline-block px-5 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
          Выбрать файлы
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {types.map(type => (
          <button
            key={type.label}
            onClick={() => openDialog(type.accept)}
            className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-accent hover:bg-accent/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Icon name={type.icon} size={18} className={type.color} />
            </div>
            <div>
              <p className="font-medium text-sm">{type.label}</p>
              <p className="text-xs text-muted-foreground">{type.ext}</p>
            </div>
          </button>
        ))}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Загружено · {uploadedFiles.length}
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map(f => (
              <div key={f.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="FileCheck" size={14} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.fileType} · {f.size}</p>
                </div>
                <button
                  onClick={() => onFileRemove(f.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookmarksSection({ onPlay }: { onPlay: (id: number) => void }) {
  const bookmarked = TRACKS.filter(t => [1, 3, 4].includes(t.id));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">Закладки</h2>
        <p className="text-muted-foreground text-sm">{bookmarked.length} сохранённых</p>
      </div>

      <div className="space-y-2">
        {bookmarked.map((track, idx) => (
          <div
            key={track.id}
            onClick={() => onPlay(track.id)}
            className="group flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-muted-foreground transition-all cursor-pointer"
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Bookmark" size={18} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{track.title}</p>
              <p className="text-sm text-muted-foreground truncate">{track.artist} · {track.genre}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-mono">{track.duration}</span>
              <button className="opacity-0 group-hover:opacity-100 w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center transition-all hover:scale-105">
                <Icon name="Play" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileSection() {
  const stats = [
    { label: "Треков", value: "5" },
    { label: "Закладок", value: "3" },
    { label: "Часов", value: "12" },
    { label: "Жанров", value: "5" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">Профиль</h2>
        <p className="text-muted-foreground text-sm">Ваша коллекция и статистика</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Icon name="User" size={28} className="text-accent" />
        </div>
        <div>
          <p className="font-semibold text-lg">Пользователь</p>
          <p className="text-muted-foreground text-sm">Участник с 2024 г.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-accent">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wide">Последние треки</h3>
        <div className="space-y-3">
          {TRACKS.slice(0, 3).map(track => (
            <div key={track.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon name="Music" size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">{track.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ theme, onThemeChange }: { theme: "dark" | "light"; onThemeChange: (t: "dark" | "light") => void }) {
  const [bgPlay, setBgPlay] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [showChords, setShowChords] = useState(true);
  const [quality, setQuality] = useState("high");

  const settings = [
    { key: "bgPlay", label: "Фоновое воспроизведение", desc: "Музыка продолжает играть при сворачивании", value: bgPlay, onChange: setBgPlay },
    { key: "autoSync", label: "Авто-синхронизация", desc: "Автоматически синхронизировать текст и аккорды", value: autoSync, onChange: setAutoSync },
    { key: "showChords", label: "Показывать аккорды", desc: "Отображать аккорды поверх текста", value: showChords, onChange: setShowChords },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">Настройки</h2>
        <p className="text-muted-foreground text-sm">Управление параметрами приложения</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <p className="font-medium text-sm mb-3">Тема оформления</p>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map(t => (
            <button
              key={t}
              onClick={() => onThemeChange(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all ${
                theme === t ? "bg-accent text-accent-foreground font-medium" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon name={t === "dark" ? "Moon" : "Sun"} size={15} />
              {t === "dark" ? "Тёмная" : "Светлая"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {settings.map(s => (
          <div key={s.key} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-sm">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
            <Switch checked={s.value} onCheckedChange={s.onChange} />
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <p className="font-medium text-sm mb-3">Качество звука</p>
        <div className="flex gap-2">
          {["low", "medium", "high"].map(q => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                quality === q ? "bg-accent text-accent-foreground font-medium" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {q === "low" ? "Эконом" : q === "medium" ? "Среднее" : "Высокое"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">Данные</h3>
        <div className="space-y-2">
          <button className="w-full text-left text-sm py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between">
            Очистить кэш
            <Icon name="ChevronRight" size={16} />
          </button>
          <button className="w-full text-left text-sm py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between">
            Экспортировать коллекцию
            <Icon name="ChevronRight" size={16} />
          </button>
          <button className="w-full text-left text-sm py-2 text-destructive hover:opacity-80 transition-opacity flex items-center justify-between">
            Удалить все данные
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

const NAV_ITEMS: { id: Section; icon: string; label: string }[] = [
  { id: "library", icon: "Library", label: "Библиотека" },
  { id: "player", icon: "Music2", label: "Плеер" },
  { id: "upload", icon: "Upload", label: "Загрузка" },
  { id: "bookmarks", icon: "Bookmark", label: "Закладки" },
  { id: "profile", icon: "User", label: "Профиль" },
  { id: "settings", icon: "Settings", label: "Настройки" },
];

const SECTION_TITLES: Record<Section, string> = {
  library: "Библиотека",
  player: "Плеер",
  upload: "Загрузка",
  bookmarks: "Закладки",
  profile: "Профиль",
  settings: "Настройки",
};

export default function Index() {
  const [section, setSection] = useState<Section>("library");
  const [prevSection, setPrevSection] = useState<Section | null>(null);
  const [activeTrackId, setActiveTrackId] = useState(1);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFilesAdded = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileRemove = (id: number) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const handlePlay = (id: number) => {
    setActiveTrackId(id);
    setPrevSection(section);
    setSection("player");
  };

  const handleNav = (s: Section) => {
    setPrevSection(null);
    setSection(s);
  };

  const handleBack = () => {
    setSection(prevSection ?? "library");
    setPrevSection(null);
  };

  const activeTrack = TRACKS.find(t => t.id === activeTrackId) || TRACKS[0];
  const showBack = section !== "library";

  return (
    <div className="min-h-screen bg-background flex flex-col font-golos">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBack ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="ArrowLeft" size={18} />
                <span className="text-sm">{SECTION_TITLES[section]}</span>
              </button>
            ) : (
              <>
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                  <Icon name="Music" size={14} className="text-accent-foreground" />
                </div>
                <span className="font-semibold tracking-tight">Нота</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span>
            {activeTrack.title}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pt-24 pb-28">
        {section === "library" && <LibrarySection onPlay={handlePlay} uploadedFiles={uploadedFiles} onDeleteUploaded={handleFileRemove} />}
        {section === "player" && <PlayerSection trackId={activeTrackId} />}
        {section === "upload" && <UploadSection uploadedFiles={uploadedFiles} onFilesAdded={handleFilesAdded} onFileRemove={handleFileRemove} />}
        {section === "bookmarks" && <BookmarksSection onPlay={handlePlay} />}
        {section === "profile" && <ProfileSection />}
        {section === "settings" && <SettingsSection theme={theme} onThemeChange={setTheme} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-2xl mx-auto px-2 py-2">
          <div className="flex">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all ${
                  section === item.id
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span className="text-[10px] leading-none">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}