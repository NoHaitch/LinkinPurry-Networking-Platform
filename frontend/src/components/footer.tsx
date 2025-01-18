const navItems = [
  { label: "Home", href: "/" },
  { label: "People", href: "/people" },
  { label: "My Network", href: "/connection" },
  { label: "Messaging", href: "/messaging" },
  { label: "About", href: "/about" },
  { label: "Privacy & Policy", href: "/privacy" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <nav className="mb-4 flex flex-wrap justify-center gap-2 md:gap-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center text-sm text-muted-foreground hover:text-blue-600"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-center border-t border-gray-200 pt-4 text-center">
          <a href="/" className="mr-1 flex items-center">
            <img
              src="/image/logo.png"
              alt="LinkInPurry Logo"
              className="mr-1 h-6 w-6"
            />
            <span className="text-sm font-bold text-blue-600">
              LinkInPurry{" "}
            </span>
          </a>
          <div className="flex flex-wrap justify-center gap-1 text-center text-sm text-gray-500">
            <p>LinkInPurry Corporation &copy; {currentYear}. </p>
            <p> All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
