
export interface VideoAsset {
  id: string;
  file: File;
  thumbnail: string;
  objectUrl: string; // Persistent URL for memory management
  duration: number;
  width: number;
  height: number;
}

export type AspectRatio = '9:16' | '16:9' | '1:1' | '2:3' | '3:4';
export type FitMode = 'cover' | 'contain';
export type Resolution = { w: number; h: number };

export interface SubtitleConfig {
  text: string; // Raw text block
  mode: 'traditional' | 'beat'; // Traditional (time-based) or Beat (sync)
  beatInterval: number; // For beat mode: 4, 8, 12, 16
  style: {
    fontSize: number;
    color: string;
    strokeColor: string;
    strokeWidth: number;
    fontFamily: string;
    yOffset: number; // % from top
    bgEnabled: boolean;
    bgOpacity: number;
  };
}

export interface TitleConfig {
  text: string;
  enabled: boolean;
  style: {
    fontSize: number;
    color: string;
    fontFamily: string;
    x: number; // 0-100%
    y: number; // 0-100%
    strokeColor: string;
    strokeWidth: number;
    shadow: boolean;
  };
}

export interface BeatConfig {
  mode: 'off' | '2' | '4' | '8' | '12' | '16';
  bpm: number;
  offset: number; // Start offset in seconds
}

export interface ExportConfig {
  ratio: AspectRatio;
  fps: number;
  quality: 'high' | 'standard' | 'low';
  clipDuration: number; // User preference for fixed length or max length
  fadeDuration: number; // Transition time
  originalVolume: number; // 0-1
  bgmVolume: number; // 0-1
}

export type Lang = 'zh' | 'en';