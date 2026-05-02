import { Twitter, Facebook, Linkedin, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };
  return (
    <div className="flex items-center gap-2">
      <a aria-label="Share on X" href={`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`} target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-secondary"><Twitter className="w-4 h-4" /></a>
      <a aria-label="Share on Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-secondary"><Facebook className="w-4 h-4" /></a>
      <a aria-label="Share on LinkedIn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-secondary"><Linkedin className="w-4 h-4" /></a>
      <button aria-label="Copy link" onClick={copy} className="p-2 rounded-md hover:bg-secondary">
        <LinkIcon className="w-4 h-4" />
      </button>
      {copied && <span className="text-xs text-accent">Copied!</span>}
    </div>
  );
}
