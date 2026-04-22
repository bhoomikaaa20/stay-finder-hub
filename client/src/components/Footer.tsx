export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/50 bg-secondary/30">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="font-display text-xl font-bold">
            Stay<span className="text-gradient">Vivid</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Book unforgettable stays. Anywhere. In seconds.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} StayVivid · Crafted with love for travelers.
        </p>
      </div>
    </footer>
  );
}
