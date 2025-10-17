import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('app-language', lng)
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-slate-400" />
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('language.english')}</SelectItem>
          <SelectItem value="ru">{t('language.russian')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

