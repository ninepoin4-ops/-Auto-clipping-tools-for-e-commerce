
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Music, Play, Video, Settings, 
  Download, Plus, X, ArrowUp, ArrowDown, Type, 
  Clock, Scissors, Loader2, Shuffle, Sparkles, HelpCircle, 
  Heading, Move, Trash2, Pause
} from 'lucide-react';
import { decodeAudioFile, detectBPM } from './services/audioService';
import { VideoAsset, BeatConfig, ExportConfig, SubtitleConfig, TitleConfig, Lang } from './types';

// --- I18N Dictionary ---
const DICT = {
  en: {
    title: "Beat CC",
    subtitle: "Rhythm Video Stitcher",
    importVideos: "Import Videos",
    clearAll: "Clear All",
    importBGM: "Import BGM",
    dragDrop: "Drag videos here or click",
    bpmDetected: "BPM Detected",
    bpmManual: "Manual BPM",
    syncMode: "Sync Mode",
    off: "Off",
    beat2: "2 Beats",
    beat4: "4 Beats",
    beat8: "8 Beats",
    beat12: "12 Beats",
    beat16: "16 Beats",
    clipDuration: "Clip Duration",
    seconds: "sec",
    subtitles: "Subtitles",
    subtitlePlaceholder: "Paste text here.\nOne line per subtitle.\nPress Enter to split.",
    subtitleMode: "Subtitle Mode",
    subModeTrad: "Traditional (Split Evenly)",
    subModeBeat: "Beat Sync",
    appearance: "Appearance",
    exportSettings: "Export Settings",
    generate: "Generate & Preview",
    exporting: "Rendering...",
    download: "Download MP4",
    resolution: "Resolution",
    transDuration: "Transition",
    fitMode: "Fit Mode",
    fitCover: "Cover (Crop)",
    fitContain: "Contain (Black Bars)",
    settings: "Settings",
    videos: "Videos",
    bgm: "Music",
    process: "Process",
    videoCount: "videos",
    durationInsufficient: "Source too short",
    fadeDuration: "Transition Fade",
    smartShuffle: "Smart Shuffle",
    shuffleDesc: "Slice long videos & randomize order",
    useSample: "Use Sample",
    loadingSample: "Loading...",
    manualTitle: "User Manual",
    manualContent: "This is Beat CC, Stark's specialized video editing tool.\nThis tool automatically synchronizes video transitions to background music beats. Subtitles can also sync to the beat. Transitions are based on musical bars; 4 beats is usually the best choice.\n\nUsage Tips:\n1. BPM is automatically detected from the BGM. Usually you don't need to change it. Increase BPM for faster cuts, decrease for slower.\n2. Smart Subtitles: Paste text, use Enter to split lines. One line per subtitle segment.\n3. Appearance: Settings for subtitles. Size around 100 is commonly used.\n4. Transition Fade: Cross-fade effect between clips. Too high might cause stuttering due to browser rendering pressure. 0.1-0.4s is recommended.\n5. BGM Volume: Adjusts music volume, does not affect beat detection.",
    globalTitle: "Global Title",
    titleText: "Title Text",
    fontFamily: "Font",
    uploadFont: "Upload Font",
    position: "Position",
    enableTitle: "Enable Title"
  },
  zh: {
    title: "Beat CC",
    subtitle: "斯塔克专用视频剪辑工具",
    importVideos: "导入视频素材",
    clearAll: "清空视频",
    importBGM: "导入背景音乐",
    dragDrop: "拖入多个视频或点击上传",
    bpmDetected: "检测 BPM",
    bpmManual: "手动 BPM",
    syncMode: "卡点模式",
    off: "关闭卡点",
    beat2: "2 拍一切",
    beat4: "4 拍一切",
    beat8: "8 拍一切",
    beat12: "12 拍一切",
    beat16: "16 拍一切",
    clipDuration: "单片段时长",
    seconds: "秒",
    subtitles: "智能字幕",
    subtitlePlaceholder: "在此粘贴文案。\n按回车换行。\n一行一句字幕。",
    subtitleMode: "字幕模式",
    subModeTrad: "传统自动 (平分时长)",
    subModeBeat: "卡点字幕 (跟随节拍)",
    appearance: "样式设置",
    exportSettings: "输出设置",
    generate: "一键生成预览",
    exporting: "合成中...",
    download: "导出 MP4",
    resolution: "分辨率",
    transDuration: "转场时长",
    fitMode: "画面填充",
    fitCover: "铺满 (裁切)",
    fitContain: "包含 (黑边)",
    settings: "设置",
    videos: "素材列表",
    bgm: "配乐",
    process: "处理",
    videoCount: "个视频",
    durationInsufficient: "素材时长不足",
    fadeDuration: "转场淡化时长",
    smartShuffle: "智能随机排布",
    shuffleDesc: "自动切分长视频并打乱顺序",
    useSample: "使用示例音频",
    loadingSample: "加载中...",
    manualTitle: "使用手册",
    manualContent: "这是beat CC。\n该工具会自动根据背景音乐来实现卡点转场，字幕也可以根据背景音乐来实现卡点转场，转场以音乐拍数来定，一般选择4拍即可。如果不想使用卡点转场功能，也可以关闭卡点。\n\n使用提示：\n1. bpm是程序自动识别的背景音乐的每分钟拍数，一般情况下不需要动，如果你想让剪辑加快增大bpm，反之则减少\n2. 智能字幕，以回车换行来实现读取每一句字幕，一行一段字幕\n3. 样式设置是字幕的样式设置，可以选择字体的颜色和字体大小，字体大小100左右较为常用\n4. 转场淡化是视频之间的转场效果，如果过大可能会导致视频卡顿，这是由于浏览器的渲染压力造成的，一般选择0.1-0.5即可\n5. bgm volume即背景音乐的音量大小，不会妨碍识别拍数",
    globalTitle: "全局大标题",
    titleText: "标题内容",
    fontFamily: "字体",
    uploadFont: "上传字体文件",
    position: "位置调整",
    enableTitle: "启用大标题"
  }
};

// Use a known CORS-friendly raw file from GitHub to avoid fetch errors
const SAMPLE_AUDIO_URL = "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/1.ogg"; 

const DEFAULT_FONTS = [
  'Arial', 
  'Verdana', 
  'Helvetica', 
  'Times New Roman', 
  'Courier New', 
  'Impact', 
  'Georgia',
  'Microsoft YaHei', // 微软雅黑
  '黑体', // 黑体
  'SimSun', // 宋体
  'PingFang SC', // 苹方 (Mac)
  'Noto Sans SC', // 思源黑体
];

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>('zh');
  const t = DICT[lang];

  // --- Assets ---
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [bgmFile, setBgmFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [availableFonts, setAvailableFonts] = useState<string[]>(DEFAULT_FONTS);

  // --- Settings ---
  const [beatConfig, setBeatConfig] = useState<BeatConfig>({ mode: '4', bpm: 120, offset: 0 });
  const [isShuffle, setIsShuffle] = useState(true);
  
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    ratio: '9:16',
    fps: 30,
    quality: 'high',
    clipDuration: 3, 
    fadeDuration: 0.2, 
    originalVolume: 0,
    bgmVolume: 1,
  });

  const [subConfig, setSubConfig] = useState<SubtitleConfig>({
    text: '',
    mode: 'traditional',
    beatInterval: 8,
    style: {
      fontSize: 80,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      fontFamily: 'Microsoft YaHei',
      yOffset: 85,
      bgEnabled: false,
      bgOpacity: 0.5,
    }
  });

  const [titleConfig, setTitleConfig] = useState<TitleConfig>({
    text: '',
    enabled: true,
    style: {
      fontSize: 120,
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
      x: 50,
      y: 20,
      strokeColor: '#000000',
      strokeWidth: 4,
      shadow: true
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // BGM Preview
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const bgmPreviewRef = useRef<HTMLAudioElement | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  // Ref for the video file input to clear selection
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup all object URLs when unmounting
      videos.forEach(v => URL.revokeObjectURL(v.objectUrl));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (bgmPreviewRef.current) {
         bgmPreviewRef.current.pause();
         bgmPreviewRef.current = null;
      }
    };
  }, []); // Only on unmount

  // Handle BGM Preview source
  useEffect(() => {
     if (bgmPreviewRef.current) {
         bgmPreviewRef.current.pause();
         bgmPreviewRef.current = null;
         setIsBgmPlaying(false);
     }
     
     if (bgmFile) {
         const url = URL.createObjectURL(bgmFile);
         const audio = new Audio(url);
         audio.onended = () => setIsBgmPlaying(false);
         bgmPreviewRef.current = audio;
         
         return () => {
             audio.pause();
             URL.revokeObjectURL(url);
         };
     }
  }, [bgmFile]);

  // --- Real-time Preview Effect ---
  useEffect(() => {
    if (previewUrl) setPreviewUrl(null);

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    let width = 1080, height = 1920;
    if (exportConfig.ratio === '16:9') { width = 1920; height = 1080; }
    if (exportConfig.ratio === '1:1') { width = 1080; height = 1080; }
    if (exportConfig.ratio === '2:3') { width = 1080; height = 1620; }
    if (exportConfig.ratio === '3:4') { width = 1080; height = 1440; }
    
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (bgImage?: HTMLImageElement) => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        if (bgImage) {
            const vRatio = bgImage.width / bgImage.height;
            const cRatio = width / height;
            let dw, dh, dx, dy;
            if (vRatio > cRatio) {
                dh = height; dw = height * vRatio; dy = 0; dx = (width - dw) / 2;
            } else {
                dw = width; dh = width / vRatio; dx = 0; dy = (height - dh) / 2;
            }
            ctx.drawImage(bgImage, dx, dy, dw, dh);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(0,0,width,height);
        } else {
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.font = '40px sans-serif';
            ctx.fillText("Preview Area", width/2, height/2);
        }

        if (titleConfig.enabled && titleConfig.text) {
             ctx.save();
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.font = `bold ${titleConfig.style.fontSize}px "${titleConfig.style.fontFamily}"`;
             
             const x = (titleConfig.style.x / 100) * width;
             const y = (titleConfig.style.y / 100) * height;

             if (titleConfig.style.shadow) {
                 ctx.shadowColor = 'rgba(0,0,0,0.75)';
                 ctx.shadowBlur = 10;
                 ctx.shadowOffsetX = 4;
                 ctx.shadowOffsetY = 4;
             }

             if (titleConfig.style.strokeWidth > 0) {
                 ctx.strokeStyle = titleConfig.style.strokeColor;
                 ctx.lineWidth = titleConfig.style.strokeWidth;
                 ctx.strokeText(titleConfig.text, x, y);
             }
             
             ctx.fillStyle = titleConfig.style.color;
             ctx.fillText(titleConfig.text, x, y);
             
             ctx.strokeStyle = 'rgba(255,255,255,0.5)';
             ctx.lineWidth = 2;
             ctx.beginPath();
             ctx.moveTo(x - 20, y); ctx.lineTo(x + 20, y);
             ctx.moveTo(x, y - 20); ctx.lineTo(x, y + 20);
             ctx.stroke();

             ctx.restore();
        }
    };

    if (videos.length > 0) {
        const img = new Image();
        img.src = videos[0].thumbnail;
        img.onload = () => draw(img);
    } else {
        draw();
    }

  }, [titleConfig, exportConfig.ratio, videos]);

  // --- Handlers ---
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newVideos: VideoAsset[] = [];
      const files = Array.from(e.target.files) as File[];
      for (const file of files) {
        const objectUrl = URL.createObjectURL(file); // Created once, reused
        const video = document.createElement('video');
        video.src = objectUrl;
        video.preload = 'metadata';
        
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.currentTime = 1; 
          };
          video.onseeked = () => {
            // FIX: Calculate proper dimensions to preserve aspect ratio
            const MAX_SIZE = 320;
            let tw = video.videoWidth;
            let th = video.videoHeight;
            const ratio = tw / th;
            
            if (tw > MAX_SIZE) {
                tw = MAX_SIZE;
                th = tw / ratio;
            }
            if (th > MAX_SIZE) {
                th = MAX_SIZE;
                tw = th * ratio;
            }

            const cvs = document.createElement('canvas');
            cvs.width = tw;
            cvs.height = th;
            cvs.getContext('2d')?.drawImage(video, 0, 0, cvs.width, cvs.height);
            newVideos.push({
              id: Math.random().toString(36).substr(2, 9),
              file,
              thumbnail: cvs.toDataURL(),
              objectUrl, // Store persistent URL
              duration: video.duration,
              width: video.videoWidth,
              height: video.videoHeight
            });
            // Do NOT revoke objectUrl here, we need it for playback
            video.remove();
            resolve(true);
          };
          video.onerror = () => {
            URL.revokeObjectURL(objectUrl); // Revoke if failed
            resolve(true);
          }
        });
      }
      setVideos(prev => [...prev, ...newVideos]);
    }
  };

  const moveVideo = (index: number, direction: -1 | 1) => {
    const newVideos = [...videos];
    if (index + direction < 0 || index + direction >= newVideos.length) return;
    const temp = newVideos[index];
    newVideos[index] = newVideos[index + direction];
    newVideos[index + direction] = temp;
    setVideos(newVideos);
  };

  const removeVideo = (index: number) => {
    // Revoke URL to free memory
    URL.revokeObjectURL(videos[index].objectUrl);
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (isProcessing) {
        alert(lang === 'zh' ? '正在处理中，请稍后...' : 'Processing, please wait...');
        return;
    }
    // Logic: Confirm before clearing
    if (window.confirm(t.clearAll + '?')) {
        // Cleanup memory for all videos
        videos.forEach(v => {
            if (v.objectUrl) URL.revokeObjectURL(v.objectUrl);
        });
        setVideos([]);
        setPreviewUrl(null);
        // Clear input value so same files can be re-selected
        if (videoInputRef.current) {
            videoInputRef.current.value = '';
        }
    }
  };

  const handleBgmUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setBgmFile(file);
      try {
        const buffer = await decodeAudioFile(file);
        setAudioBuffer(buffer);
        const detected = await detectBPM(buffer);
        setBeatConfig(prev => ({ ...prev, bpm: detected }));
      } catch (err) {
        console.error("Audio decode failed", err);
      }
    }
  };
  
  const toggleBgmPreview = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      
      if (bgmPreviewRef.current) {
          if (isBgmPlaying) {
              bgmPreviewRef.current.pause();
              setIsBgmPlaying(false);
          } else {
              bgmPreviewRef.current.play();
              setIsBgmPlaying(true);
          }
      }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const fontName = file.name.split('.')[0];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (arrayBuffer) {
           const fontFace = new FontFace(fontName, arrayBuffer);
           try {
             await fontFace.load();
             document.fonts.add(fontFace);
             setAvailableFonts(prev => [fontName, ...prev]);
             setTitleConfig(prev => ({...prev, style: {...prev.style, fontFamily: fontName}}));
           } catch (err) {
             console.error("Failed to load font", err);
             alert("Invalid font file.");
           }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleUseSampleBgm = async () => {
      setIsLoadingSample(true);
      try {
          const response = await fetch(SAMPLE_AUDIO_URL);
          const blob = await response.blob();
          const file = new File([blob], "Sample_Beat.mp3", { type: "audio/mp3" });
          
          setBgmFile(file);
          const buffer = await decodeAudioFile(file);
          setAudioBuffer(buffer);
          const detected = await detectBPM(buffer);
          setBeatConfig(prev => ({ ...prev, bpm: detected }));
      } catch (err) {
          console.error("Failed to load sample", err);
          alert("Could not load sample audio. Please check connection.");
      } finally {
          setIsLoadingSample(false);
      }
  };

  const generateVideo = async () => {
    if (videos.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setPreviewUrl(null);

    const canvas = canvasRef.current;
    if (!canvas) {
        setIsProcessing(false);
        return;
    }

    try {
        // --- Optimization: Setup Canvas ---
        let width = 1080, height = 1920;
        if (exportConfig.ratio === '16:9') { width = 1920; height = 1080; }
        if (exportConfig.ratio === '1:1') { width = 1080; height = 1080; }
        if (exportConfig.ratio === '2:3') { width = 1080; height = 1620; }
        if (exportConfig.ratio === '3:4') { width = 1080; height = 1440; }
        
        canvas.width = width;
        canvas.height = height;
        
        // Optimization: Disable alpha channel for background canvas, use standard quality
        const ctx = canvas.getContext('2d', { alpha: false }); 
        if (!ctx) throw new Error("Could not get canvas context");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium'; // Changed from 'high' to 'medium' for performance

        // --- Timeline Calculation ---
        const beatDuration = 60 / beatConfig.bpm;
        let baseClipDuration = exportConfig.clipDuration;
        if (beatConfig.mode !== 'off') {
          baseClipDuration = parseInt(beatConfig.mode) * beatDuration;
        }

        const fadeDur = exportConfig.fadeDuration;
        // Optimization: Increased preload window to 4s to prevent lag/stuck frames
        const PRELOAD_WINDOW = 4.0; 
        
        const timelineClips: any[] = [];
        let sourceSegments: { video: VideoAsset; srcStart: number }[] = [];

        // Smart Shuffle Logic
        if (isShuffle) {
            videos.forEach(v => {
                let cursor = 0;
                while (cursor + baseClipDuration <= v.duration) {
                    sourceSegments.push({
                        video: v,
                        srcStart: cursor
                    });
                    cursor += baseClipDuration;
                }
            });
            // Fisher-Yates shuffle
            for (let i = sourceSegments.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [sourceSegments[i], sourceSegments[j]] = [sourceSegments[j], sourceSegments[i]];
            }
        } else {
            sourceSegments = videos.map(v => ({ video: v, srcStart: 0 }));
        }

        let currentGlobalTime = 0;
        sourceSegments.forEach((seg) => {
            timelineClips.push({
                videoAsset: seg.video,
                startTime: currentGlobalTime,
                endTime: currentGlobalTime + baseClipDuration,
                srcStart: seg.srcStart, 
            });
            currentGlobalTime += baseClipDuration;
        });

        const totalDuration = currentGlobalTime;

        if (timelineClips.length === 0) {
            alert(t.durationInsufficient);
            setIsProcessing(false);
            return;
        }

        // --- Audio Setup ---
        const AudioContextClass = window.AudioContext || (window as any)['webkitAudioContext'];
        const actx = new AudioContextClass();
        const dest = actx.createMediaStreamDestination();
        
        if (audioBuffer && exportConfig.bgmVolume > 0) {
            const src = actx.createBufferSource();
            src.buffer = audioBuffer;
            src.loop = true;
            const gain = actx.createGain();
            gain.gain.value = exportConfig.bgmVolume;
            src.connect(gain).connect(dest);
            src.start(0);
        }

        // --- Recording Setup ---
        const stream = canvas.captureStream(exportConfig.fps);
        const combinedTracks = [...stream.getVideoTracks(), ...dest.stream.getAudioTracks()];
        const mixedStream = new MediaStream(combinedTracks);
        
        const getSupportedMimeType = () => {
            const types = [
                'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', 
                'video/mp4; codecs="avc1.4d401e, mp4a.40.2"', 
                'video/mp4; codecs="avc1.64001e, mp4a.40.2"', 
                'video/mp4',
                'video/webm; codecs=vp9',
                'video/webm'
            ];
            for (const t of types) {
                if (MediaRecorder.isTypeSupported(t)) return t;
            }
            return 'video/webm';
        };
        const mimeType = getSupportedMimeType();

        // Optimization: Reduced bitrate to 8Mbps for better stability
        const recorder = new MediaRecorder(mixedStream, {
            mimeType,
            videoBitsPerSecond: 8000000 
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.start();

        // --- Video Player Setup ---
        const playerA = document.createElement('video');
        const playerB = document.createElement('video');
        [playerA, playerB].forEach(p => {
            p.muted = true;
            p.playsInline = true;
            p.preload = 'auto';
            p.crossOrigin = 'anonymous';
            // Optimization: disable pip to save resources
            p.disablePictureInPicture = true;
        });

        const drawVideo = (v: HTMLVideoElement, alpha: number) => {
            if (alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = alpha;
            
            const vRatio = v.videoWidth / v.videoHeight;
            const cRatio = width / height;
            let dw, dh, dx, dy;

            // Fit Cover Logic
            if (vRatio > cRatio) {
                dh = height;
                dw = height * vRatio;
                dy = 0;
                dx = (width - dw) / 2;
            } else {
                dw = width;
                dh = width / vRatio;
                dx = 0;
                dy = (height - dh) / 2;
            }
            
            ctx.drawImage(v, dx, dy, dw, dh);
            ctx.restore();
        };

        const drawSubtitles = (time: number) => {
            if (!subConfig.text) return;
            const lines = subConfig.text.split('\n').filter(l => l.trim());
            if (lines.length === 0) return;

            let activeText = '';
            if (subConfig.mode === 'traditional') {
                const durationPerLine = totalDuration / lines.length;
                const index = Math.floor(time / durationPerLine);
                if (index >= 0 && index < lines.length) activeText = lines[index];
            } else {
                const subBeatDur = subConfig.beatInterval * beatDuration;
                const index = Math.floor(time / subBeatDur);
                if (index >= 0 && index < lines.length) activeText = lines[index];
            }

            if (activeText) {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `bold ${subConfig.style.fontSize}px "${subConfig.style.fontFamily}"`;
                const x = width / 2;
                const y = (subConfig.style.yOffset / 100) * height;

                if (subConfig.style.bgEnabled) {
                    const m = ctx.measureText(activeText);
                    ctx.fillStyle = `rgba(0,0,0,${subConfig.style.bgOpacity})`;
                    ctx.fillRect(x - m.width/2 - 20, y - subConfig.style.fontSize/2 - 10, m.width + 40, subConfig.style.fontSize + 20);
                }
                if (subConfig.style.strokeWidth > 0) {
                    ctx.strokeStyle = subConfig.style.strokeColor;
                    ctx.lineWidth = subConfig.style.strokeWidth;
                    ctx.strokeText(activeText, x, y);
                }
                ctx.fillStyle = subConfig.style.color;
                ctx.fillText(activeText, x, y);
                ctx.restore();
            }
        };

        const drawGlobalTitle = () => {
           if (!titleConfig.enabled || !titleConfig.text) return;
           ctx.save();
           ctx.textAlign = 'center';
           ctx.textBaseline = 'middle';
           ctx.font = `bold ${titleConfig.style.fontSize}px "${titleConfig.style.fontFamily}"`;
           
           const x = (titleConfig.style.x / 100) * width;
           const y = (titleConfig.style.y / 100) * height;

           if (titleConfig.style.shadow) {
               ctx.shadowColor = 'rgba(0,0,0,0.75)';
               ctx.shadowBlur = 10;
               ctx.shadowOffsetX = 4;
               ctx.shadowOffsetY = 4;
           }

           if (titleConfig.style.strokeWidth > 0) {
               ctx.strokeStyle = titleConfig.style.strokeColor;
               ctx.lineWidth = titleConfig.style.strokeWidth;
               ctx.strokeText(titleConfig.text, x, y);
           }
           
           ctx.fillStyle = titleConfig.style.color;
           ctx.fillText(titleConfig.text, x, y);
           
           ctx.restore();
        };

        let startTime = performance.now();
        let currentClipIdx = -1;
        let nextClipPreparedIdx = -1;
        
        const getPlayer = (idx: number) => (idx % 2 === 0 ? playerA : playerB);

        const preparePlayer = async (p: HTMLVideoElement, asset: VideoAsset, startTime: number) => {
            return new Promise<void>((resolve) => {
                // Optimization: Use persistent ObjectURL instead of creating new ones
                if (p.dataset.assetId !== asset.id) {
                    p.src = asset.objectUrl; 
                    p.dataset.assetId = asset.id;
                }
                p.dataset.srcStart = startTime.toString();
                
                // Smart seek: only seek if difference is significant to reduce glitch
                if (Math.abs(p.currentTime - startTime) > 0.1) {
                    p.currentTime = startTime;
                }
                
                const onCanPlay = () => {
                    p.removeEventListener('canplay', onCanPlay);
                    resolve();
                };
                
                // Safety timeout for seek
                const timeout = setTimeout(() => {
                    p.removeEventListener('canplay', onCanPlay);
                    resolve();
                }, 3000);

                if (p.readyState >= 3) {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    p.addEventListener('canplay', () => {
                        clearTimeout(timeout);
                        onCanPlay();
                    });
                }
            });
        };

        // Init first clip
        await preparePlayer(playerA, timelineClips[0].videoAsset, timelineClips[0].srcStart);

        const loop = async () => {
            const now = performance.now();
            const timeElapsed = (now - startTime) / 1000; 

            if (timeElapsed >= totalDuration) {
                recorder.stop();
                playerA.pause();
                playerB.pause();
                // cleanup players
                playerA.src = '';
                playerB.src = '';
                actx.close();
                return;
            }

            setProgress((timeElapsed / totalDuration) * 100);

            const activeIdx = timelineClips.findIndex(c => timeElapsed >= c.startTime && timeElapsed < c.endTime);
            
            if (activeIdx !== -1) {
                if (currentClipIdx !== activeIdx) {
                    currentClipIdx = activeIdx;
                    const p = getPlayer(activeIdx);
                    if (p.paused) await p.play().catch(() => {});
                }

                // WATCHDOG: Force play if paused unintentionally (e.g. browser throttled it)
                const activePlayer = getPlayer(activeIdx);
                if (activePlayer.paused && activePlayer.readyState >= 2 && !activePlayer.ended) {
                    activePlayer.play().catch(() => {});
                }

                const clip = timelineClips[activeIdx];
                const timeUntilEnd = clip.endTime - timeElapsed;
                const isLastClip = activeIdx === timelineClips.length - 1;

                // Preload next clip
                if (!isLastClip && timeUntilEnd < (fadeDur + PRELOAD_WINDOW)) {
                    const nextIdx = activeIdx + 1;
                    if (nextClipPreparedIdx !== nextIdx) {
                        nextClipPreparedIdx = nextIdx;
                        const nextP = getPlayer(nextIdx);
                        const nextClip = timelineClips[nextIdx];
                        preparePlayer(nextP, nextClip.videoAsset, nextClip.srcStart);
                    }
                }

                // Start playing next clip for crossfade
                if (!isLastClip && timeUntilEnd < (fadeDur + 0.05)) {
                    const nextP = getPlayer(activeIdx + 1);
                    if (nextP.paused && nextP.readyState >= 2) {
                        await nextP.play().catch(() => {});
                    }
                }
            }

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, width, height);

            if (activeIdx !== -1) {
                const clip = timelineClips[activeIdx];
                const p = getPlayer(activeIdx);
                const timeUntilEnd = clip.endTime - timeElapsed;
                
                let alpha = 1;
                if (activeIdx < timelineClips.length - 1 && timeUntilEnd < fadeDur) {
                    alpha = Math.max(0, timeUntilEnd / fadeDur);
                }
                
                if (p.readyState >= 2) {
                    drawVideo(p, alpha);
                }

                if (activeIdx < timelineClips.length - 1 && timeUntilEnd < fadeDur) {
                    const nextP = getPlayer(activeIdx + 1);
                    if (nextP.readyState >= 2) {
                        drawVideo(nextP, 1 - alpha);
                    }
                }
            }
            
            drawSubtitles(timeElapsed);
            drawGlobalTitle();
            requestAnimationFrame(loop);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
            setPreviewUrl(URL.createObjectURL(blob));
            setIsProcessing(false);
        };

        loop();

    } catch (e) {
        console.error("Generation failed", e);
        setIsProcessing(false);
        alert(lang === 'zh' ? '生成失败，请检查浏览器兼容性' : 'Generation failed');
    }
  };

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-200 font-sans flex flex-col ${lang === 'zh' ? 'font-sans-sc' : ''}`}>
      {/* Optimization: Use fixed off-screen canvas instead of hidden to prevent rendering freeze */}
      <canvas 
          ref={canvasRef} 
          className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none" 
      />

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">{t.manualTitle}</h3>
                    <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {t.manualContent}
                </div>
                <div className="p-4 border-t border-zinc-800 flex justify-end">
                    <button onClick={() => setShowHelp(false)} className="px-4 py-2 bg-white text-black rounded font-medium hover:bg-zinc-200 text-sm transition-colors">
                        OK
                    </button>
                </div>
            </div>
        </div>
      )}

      <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-6 backdrop-blur">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Scissors className="text-white w-5 h-5" />
            </div>
            <div>
                <h1 className="text-lg font-bold leading-none tracking-tight">{t.title}</h1>
                <span className="text-xs text-zinc-500 font-medium">{t.subtitle}</span>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setShowHelp(true)} className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5" />
            </button>
            <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')} className="text-xs font-mono border border-zinc-700 rounded px-2 py-1 hover:bg-zinc-800 transition-colors">
                {lang === 'en' ? 'EN / 中文' : '中文 / EN'}
            </button>
            <button disabled={isProcessing} onClick={generateVideo} className="bg-white text-black hover:bg-zinc-200 px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isProcessing ? <><Loader2 className="animate-spin w-4 h-4" /> {Math.round(progress)}%</> : <><Play className="w-4 h-4 fill-current" /> {t.generate}</>}
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex">
        
        <div className="w-80 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.videos}</h2>
                {/* Clear All Button Removed from here */}
            </div>

            <div className="px-4 pb-4 border-b border-zinc-800">
                <div className="relative group">
                    <input 
                        ref={videoInputRef}
                        type="file" 
                        multiple 
                        accept="video/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={handleVideoUpload} 
                    />
                    <div className="border border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-zinc-400 group-hover:border-zinc-500 group-hover:bg-zinc-800/50 transition-all">
                        <Plus className="w-6 h-6" />
                        <span className="text-xs">{t.importVideos}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {videos.map((v, i) => (
                    <div key={v.id} className="bg-zinc-800/50 rounded p-2 flex gap-3 group relative hover:bg-zinc-800 transition-colors">
                        <img src={v.thumbnail} className="w-16 h-16 object-cover rounded bg-black" />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-sm font-medium truncate text-zinc-300">{v.file.name}</p>
                            <p className="text-xs text-zinc-500">{Math.round(v.duration)}s • {v.width}x{v.height}</p>
                        </div>
                        <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => moveVideo(i, -1)} className="p-1 hover:bg-zinc-700 rounded"><ArrowUp className="w-3 h-3" /></button>
                            <button onClick={() => moveVideo(i, 1)} className="p-1 hover:bg-zinc-700 rounded"><ArrowDown className="w-3 h-3" /></button>
                            <button onClick={() => removeVideo(i)} className="p-1 hover:bg-red-900/50 text-red-400 rounded"><X className="w-3 h-3" /></button>
                        </div>
                    </div>
                ))}
                {videos.length === 0 && (
                    <div className="text-center py-10 text-zinc-600 text-sm">{t.dragDrop}</div>
                )}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                {videos.length > 0 && (
                    <button 
                        type="button"
                        onClick={handleClearAll}
                        className="w-full mb-4 flex items-center justify-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 px-3 py-2 rounded transition-colors"
                    >
                        <Trash2 className="w-3 h-3" /> {t.clearAll}
                    </button>
                )}

                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">{t.bgm}</h2>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input type="file" accept="audio/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleBgmUpload} />
                        <div className={`border rounded-xl p-6 flex items-center gap-4 ${bgmFile ? 'border-purple-500/50 bg-purple-500/10' : 'border-zinc-700 hover:bg-zinc-800'}`}>
                            <Music className={`w-8 h-8 ${bgmFile ? 'text-purple-400' : 'text-zinc-500'}`} />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{bgmFile ? bgmFile.name : t.importBGM}</div>
                                {bgmFile && <div className="text-xs text-purple-400">{beatConfig.bpm} BPM</div>}
                            </div>
                            {bgmFile && (
                                <button 
                                   type="button"
                                   onClick={toggleBgmPreview}
                                   className="z-20 p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                                >
                                   {isBgmPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                                </button>
                            )}
                        </div>
                    </div>
                    {!bgmFile && (
                        <button 
                            onClick={handleUseSampleBgm} 
                            disabled={isLoadingSample}
                            className="w-16 border border-zinc-700 rounded-xl flex items-center justify-center hover:bg-zinc-800 hover:text-purple-400 text-zinc-500 transition-colors"
                            title={t.useSample}
                        >
                            {isLoadingSample ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="flex-1 bg-black flex items-center justify-center p-8 relative">
            <div 
                className="relative shadow-2xl overflow-hidden bg-zinc-900 border border-zinc-800"
                style={{ 
                    aspectRatio: exportConfig.ratio === '9:16' ? '9/16' : exportConfig.ratio === '16:9' ? '16/9' : exportConfig.ratio === '1:1' ? '1/1' : exportConfig.ratio === '2:3' ? '2/3' : '3/4',
                    height: '100%',
                    maxHeight: '80vh',
                    width: 'auto'
                }}
            >
                {/* Live Preview Canvas */}
                <canvas 
                  ref={previewCanvasRef} 
                  className={`w-full h-full object-contain ${previewUrl ? 'hidden' : 'block'}`} 
                />

                {previewUrl ? (
                    <video src={previewUrl} controls className="w-full h-full object-contain absolute inset-0 z-10 bg-black" loop autoPlay />
                ) : null}

                {videos.length === 0 && !previewUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 pointer-events-none">
                        <Video className="w-12 h-12 mb-4 opacity-20" />
                        <p>{t.generate}</p>
                    </div>
                )}
            </div>
        </div>

        <div className="w-80 flex-shrink-0 border-l border-zinc-800 bg-zinc-900/30 overflow-y-auto">
            
            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-4 text-pink-400">
                    <Clock className="w-4 h-4" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">{t.syncMode}</h2>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-zinc-500 block mb-2">{t.syncMode}</label>
                        <select 
                            value={beatConfig.mode} 
                            onChange={(e) => setBeatConfig({...beatConfig, mode: e.target.value as any})}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm focus:border-pink-500 outline-none"
                        >
                            <option value="off">{t.off}</option>
                            <option value="2">{t.beat2}</option>
                            <option value="4">{t.beat4}</option>
                            <option value="8">{t.beat8}</option>
                            <option value="12">{t.beat12}</option>
                            <option value="16">{t.beat16}</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs text-zinc-500 block mb-2">BPM</label>
                            <input 
                                type="number" 
                                value={beatConfig.bpm} 
                                onChange={(e) => setBeatConfig({...beatConfig, bpm: parseInt(e.target.value)})}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm" 
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-zinc-500 block mb-2">{t.clipDuration}</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={exportConfig.clipDuration}
                                    disabled={beatConfig.mode !== 'off'} 
                                    onChange={(e) => setExportConfig({...exportConfig, clipDuration: parseFloat(e.target.value)})}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm disabled:opacity-50" 
                                />
                                {beatConfig.mode !== 'off' && (
                                    <div className="absolute inset-y-0 right-3 flex items-center text-xs text-pink-500 font-mono">
                                        Auto
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded bg-zinc-950 border border-zinc-800">
                        <button 
                            onClick={() => setIsShuffle(!isShuffle)}
                            className={`w-10 h-5 rounded-full relative transition-colors mt-0.5 ${isShuffle ? 'bg-pink-600' : 'bg-zinc-700'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isShuffle ? 'left-6' : 'left-1'}`} />
                        </button>
                        <div>
                            <div className="text-sm font-medium flex items-center gap-2">
                                {t.smartShuffle} <Shuffle className="w-3 h-3 text-zinc-500" />
                            </div>
                            <div className="text-xs text-zinc-500">{t.shuffleDesc}</div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-4 text-yellow-400">
                    <Heading className="w-4 h-4" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">{t.globalTitle}</h2>
                </div>
                
                <div className="space-y-4">
                     <textarea 
                        value={titleConfig.text}
                        onChange={(e) => setTitleConfig({...titleConfig, text: e.target.value})}
                        placeholder={t.titleText}
                        className="w-full h-16 bg-zinc-950 border border-zinc-700 rounded p-3 text-xs mb-2 focus:border-yellow-500 outline-none resize-none"
                    />

                    <div>
                        <label className="text-xs text-zinc-500 block mb-2">{t.fontFamily}</label>
                        <div className="flex gap-2">
                            <select 
                                value={titleConfig.style.fontFamily}
                                onChange={(e) => setTitleConfig(p => ({...p, style: {...p.style, fontFamily: e.target.value}}))}
                                className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm"
                            >
                                {availableFonts.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <div className="relative">
                                <input type="file" accept=".ttf,.otf,.woff" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFontUpload} />
                                <button className="h-full px-3 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 text-zinc-400" title={t.uploadFont}>
                                    <Upload className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                             <label className="text-xs text-zinc-500 block mb-1">Size</label>
                             <input 
                                type="number" 
                                value={titleConfig.style.fontSize}
                                onChange={(e) => setTitleConfig(p => ({...p, style: {...p.style, fontSize: parseInt(e.target.value)}}))}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm"
                            />
                        </div>
                        <div>
                             <label className="text-xs text-zinc-500 block mb-1">Color</label>
                             <input 
                                type="color" 
                                value={titleConfig.style.color}
                                onChange={(e) => setTitleConfig(p => ({...p, style: {...p.style, color: e.target.value}}))}
                                className="w-full h-8 bg-transparent cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 block mb-2 flex items-center gap-2"><Move className="w-3 h-3"/> {t.position} X / Y</label>
                        <div className="space-y-2">
                            <input 
                                type="range" min="0" max="100" 
                                value={titleConfig.style.x}
                                onChange={(e) => setTitleConfig(p => ({...p, style: {...p.style, x: parseInt(e.target.value)}}))}
                                className="w-full accent-yellow-500 h-1 bg-zinc-700 rounded appearance-none"
                                title="X Position"
                            />
                            <input 
                                type="range" min="0" max="100" 
                                value={titleConfig.style.y}
                                onChange={(e) => setTitleConfig(p => ({...p, style: {...p.style, y: parseInt(e.target.value)}}))}
                                className="w-full accent-yellow-500 h-1 bg-zinc-700 rounded appearance-none"
                                title="Y Position"
                            />
                        </div>
                    </div>

                </div>
            </div>

            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-4 text-blue-400">
                    <Type className="w-4 h-4" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">{t.subtitles}</h2>
                </div>
                <textarea 
                    value={subConfig.text}
                    onChange={(e) => setSubConfig({...subConfig, text: e.target.value})}
                    placeholder={t.subtitlePlaceholder}
                    className="w-full h-32 bg-zinc-950 border border-zinc-700 rounded p-3 text-xs mb-4 focus:border-blue-500 outline-none resize-none"
                />
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-zinc-500 block mb-2">{t.subtitleMode}</label>
                        <select 
                            value={subConfig.mode} 
                            onChange={(e) => setSubConfig({...subConfig, mode: e.target.value as any})}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm"
                        >
                            <option value="traditional">{t.subModeTrad}</option>
                            <option value="beat">{t.subModeBeat}</option>
                        </select>
                    </div>
                    {subConfig.mode === 'beat' && (
                        <div>
                            <label className="text-xs text-zinc-500 block mb-2">Switch every (beats)</label>
                            <div className="flex bg-zinc-950 rounded border border-zinc-700 overflow-hidden">
                                {[4, 8, 12, 16].map(b => (
                                    <button 
                                        key={b}
                                        onClick={() => setSubConfig({...subConfig, beatInterval: b})}
                                        className={`flex-1 py-1 text-xs ${subConfig.beatInterval === b ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800'}`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                    <label className="text-xs font-bold text-zinc-500 mb-2 block">{t.appearance}</label>
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            type="color" 
                            value={subConfig.style.color}
                            onChange={(e) => setSubConfig(p => ({...p, style: {...p.style, color: e.target.value}}))}
                            className="w-full h-8 bg-transparent cursor-pointer"
                        />
                        <input 
                            type="number" 
                            value={subConfig.style.fontSize}
                            onChange={(e) => setSubConfig(p => ({...p, style: {...p.style, fontSize: parseInt(e.target.value)}}))}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 text-sm"
                            title="Font Size"
                        />
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center gap-2 mb-4 text-green-400">
                    <Download className="w-4 h-4" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">{t.exportSettings}</h2>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {['9:16', '16:9', '1:1', '2:3', '3:4'].map(r => (
                        <button 
                            key={r}
                            onClick={() => setExportConfig({...exportConfig, ratio: r as any})}
                            className={`py-2 text-xs border rounded ${exportConfig.ratio === r ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-zinc-500 flex justify-between mb-1">
                            {t.fadeDuration} <span>{exportConfig.fadeDuration}s</span>
                        </label>
                        <input 
                            type="range" min="0.1" max="2.0" step="0.1" 
                            value={exportConfig.fadeDuration}
                            onChange={(e) => setExportConfig({...exportConfig, fadeDuration: parseFloat(e.target.value)})}
                            className="w-full accent-green-500 h-1 bg-zinc-700 rounded appearance-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 flex justify-between mb-1">BGM Volume <span>{Math.round(exportConfig.bgmVolume * 100)}%</span></label>
                        <input 
                            type="range" min="0" max="1" step="0.1" 
                            value={exportConfig.bgmVolume}
                            onChange={(e) => setExportConfig({...exportConfig, bgmVolume: parseFloat(e.target.value)})}
                            className="w-full accent-green-500 h-1 bg-zinc-700 rounded appearance-none"
                        />
                    </div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;
