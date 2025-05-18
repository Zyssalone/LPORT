// components/CopyToClipboard.js
'use client'

import { useState } from 'react'

export default function CopyToClipboard({ textToCopy }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea')
        textarea.value = textToCopy
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button 
      onClick={handleCopy}
      className="px-3 py-1 bg-[#22B205] hover:bg-[#166B04] rounded text-sm transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}