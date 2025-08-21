import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Alert, Button, Space, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Alert
            message="Something went wrong"
            description={
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Text>
                  An unexpected error occurred while rendering the application.
                </Text>
                {this.state.error && (
                  <Text code style={{ fontSize: '12px' }}>
                    {this.state.error.message}
                  </Text>
                )}
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={this.handleReload}
                >
                  Try Again
                </Button>
              </Space>
            }
            type="error"
            showIcon
            style={{ 
              maxWidth: '600px',
              textAlign: 'left'
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;