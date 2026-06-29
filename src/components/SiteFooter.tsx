export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-[2fr_1fr_1fr] text-sm">
        <div>
          <p className="font-display text-2xl font-bold">
            Inkwell<span className="display-italic text-gradient-ember">.</span>
          </p>
          <p className="mt-3 max-w-sm text-muted-foreground leading-relaxed">
            Essays, notes, and field reports from Shannon J. Love — stories that shape culture.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Elsewhere</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="https://medium.com/@shannonjeffreylove" className="hover:text-accent">Medium ↗</a></li>
            <li><a href="https://shannonj.love" className="hover:text-accent">Portfolio ↗</a></li>
          </ul>
        </div>
        <div className="md:text-right">
          <p className="eyebrow mb-3">Colophon</p>
          <p className="text-muted-foreground">Set in Fraunces &amp; Inter.<br />© {new Date().getFullYear()} SJL</p>
        </div>
      </div>
    </footer>
  );
}
