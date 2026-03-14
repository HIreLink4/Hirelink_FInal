import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function SearchBar({ 
  placeholder = "Search services, providers...", 
  className = "",
  onSearch,
  autoFocus = false,
  showButton = true,
  variant = "default" // "default" | "hero" | "compact"
}) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  // Variant styles
  const variants = {
    default: {
      container: "relative",
      form: "flex items-center gap-2",
      inputWrapper: `relative flex-1 ${isFocused ? 'ring-2 ring-primary-500 ring-offset-1' : ''} rounded-xl transition-all`,
      input: "w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors",
      icon: "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400",
      clearBtn: "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors",
      button: "btn-primary px-6"
    },
    hero: {
      container: "relative",
      form: "flex items-center gap-2 bg-white rounded-2xl p-2 shadow-2xl shadow-black/10",
      inputWrapper: "relative flex-1",
      input: "w-full pl-11 pr-10 py-3 text-lg text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent",
      icon: "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400",
      clearBtn: "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors",
      button: "btn-accent px-8 py-3 text-lg"
    },
    compact: {
      container: "relative",
      form: "flex items-center",
      inputWrapper: `relative flex-1 ${isFocused ? 'ring-2 ring-primary-500' : ''} rounded-lg transition-all`,
      input: "w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 transition-all",
      icon: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
      clearBtn: "absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors",
      button: "hidden"
    }
  }

  const styles = variants[variant] || variants.default

  return (
    <div className={`${styles.container} ${className}`}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <MagnifyingGlassIcon className={styles.icon} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={styles.input}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearBtn}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        {showButton && variant !== 'compact' && (
          <button type="submit" className={styles.button}>
            Search
          </button>
        )}
      </form>
    </div>
  )
}
