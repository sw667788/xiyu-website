
import zh from './zh';
import en from './en';
import ko from './ko';

export type Language = 'zh' | 'en' | 'ko';

export const translations = {
  zh,
  en,
  ko
};

export type Translation = typeof zh;
