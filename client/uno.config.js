import { 
  defineConfig,
  presetWind4,
  transformerCompileClass,
  transformerVariantGroup
} from 'unocss';

export default defineConfig({
  presets: [presetWind4()],
  transformers: [
    transformerVariantGroup(),
    transformerCompileClass(),
  ],
  
  theme: {
    colors: {
      primary: 'oklch(64.6% 0.222 41.116)', // orange-600
      secondary: 'oklch(66.6% 0.179 58.318)', // amber-600
      danger: 'oklch(58.6% 0.253 17.585)', // rose-600
    },
  },
});