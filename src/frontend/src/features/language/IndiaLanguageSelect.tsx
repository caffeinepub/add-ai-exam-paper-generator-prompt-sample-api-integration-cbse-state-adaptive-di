/**
 * Reusable India language selection dropdown component.
 * Displays all Eighth Schedule languages plus English.
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDIA_LANGUAGES, IndiaLanguageValue } from './indiaLanguages';

interface IndiaLanguageSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

export function IndiaLanguageSelect({ value, onValueChange, id, placeholder = 'Select language' }: IndiaLanguageSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {INDIA_LANGUAGES.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
