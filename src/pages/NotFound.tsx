import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          The requested page route doesn't exist or may have been relocated.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            icon={<Home className="w-4 h-4" />}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
