import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('IntegratedDashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Dashboard Error</h2>
          <p className="text-red-700 mb-4">
            The integrated dashboard encountered an error. Using fallback display.
          </p>
          <details className="text-left bg-white p-4 rounded border text-sm text-gray-700">
            <summary className="font-medium text-red-800 cursor-pointer mb-2">
              Error Details (Click to expand)
            </summary>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40">
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;