import { Download } from 'lucide-react';
import Button from './ui/Button';

export default function Footer() {
  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Export clicked');
  };

  return (
    <footer className="border-t border-gray-200 bg-white py-4">
      <div className="container-app flex items-center justify-between">
        <p className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Tabiya. All rights reserved.
        </p>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download size={16} />
          Export CSV
        </Button>
      </div>
    </footer>
  );
}
