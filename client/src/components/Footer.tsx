export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/50 bg-secondary/30">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">

        {/* Left Section */}
        <div>
          <p className="font-display text-xl font-bold">
            Stay<span className="text-gradient">Vivid</span> London
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Book unforgettable stays across London — from luxury city suites to charming boutique hotels.
          </p>

          {/* Contact Details */}
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <p>📍 221B Baker Street, London, NW1 6XE, UK</p>
            <p>📞 +44 20 7946 0958</p>
            <p>✉️ support@stayvivid.co.uk</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="text-xs text-muted-foreground md:text-right">
          <p>Serving: Westminster · Camden · Kensington · Shoreditch · Canary Wharf</p>
          <p className="mt-1">
            © {new Date().getFullYear()} StayVivid · Crafted for London travelers.
          </p>
        </div>
      </div>
    </footer>
  );
}