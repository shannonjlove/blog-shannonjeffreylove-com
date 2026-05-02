export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-4 text-sm text-muted-foreground">
        <p className="font-display text-base text-foreground">Inkwell<span className="text-accent">.</span></p>
        <p>Personal writing & portfolio. © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
