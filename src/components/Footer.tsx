export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-4">
      <div className="container-app">
        <p className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Tabiya. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
