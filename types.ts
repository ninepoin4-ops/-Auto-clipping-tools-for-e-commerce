
export interface VideoAsset {
  id: string;
  file: File;
  thumbnail: string;
  objectUrl: string; // Persistent URL for memory management
  duration: number;
  width: number;
  height: number;
  trimStart: number; // Skip first N seconds (for AI-generated videos with same first frame)
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
  lines: number;
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
  skipStart: number; // Skip first N seconds of each video (for AI-generated videos)
}

export interface ExportConfig {
  ratio: AspectRatio;
  fps: number;
  quality: 'high' | 'standard' | 'low';
  clipDuration: number;
  fadeDuration: number;
  originalVolume: number;
  bgmVolume: number;
  playbackRate: number;
}

export type Lang = 'zh' | 'en';