/// <reference types="vite/client" />

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';

type ImportMetaEnv = {
  readonly VITE_API_URL?: string;
  readonly VITE_WECHAT_APP_ID?: string;
  readonly VITE_UPDATE_API_URL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
};

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
