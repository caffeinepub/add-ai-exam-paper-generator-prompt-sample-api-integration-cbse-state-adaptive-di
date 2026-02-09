/**
 * Shared India native language options for use across the application.
 * Includes English plus all 22 Eighth Schedule languages.
 */

export const INDIA_LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'assamese', label: 'Assamese' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'bodo', label: 'Bodo' },
  { value: 'dogri', label: 'Dogri' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'kashmiri', label: 'Kashmiri' },
  { value: 'konkani', label: 'Konkani' },
  { value: 'maithili', label: 'Maithili' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'manipuri', label: 'Manipuri (Meitei)' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'nepali', label: 'Nepali' },
  { value: 'odia', label: 'Odia' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'sanskrit', label: 'Sanskrit' },
  { value: 'santali', label: 'Santali' },
  { value: 'sindhi', label: 'Sindhi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'urdu', label: 'Urdu' },
] as const;

export type IndiaLanguageValue = typeof INDIA_LANGUAGES[number]['value'];
